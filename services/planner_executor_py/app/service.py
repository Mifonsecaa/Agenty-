from __future__ import annotations

import hashlib
import json
from dataclasses import asdict
from typing import Dict, List

from .extractor import extract, normalize_text
from .models import ActionOutput, ActionType, ConversationState, PlannerInput, Stage
from .policy import check_privacy_guardrails

REQUIRED_FIELDS = ["date", "time", "people", "name"]
ACTIVE_CRITICAL_STAGES = {
    Stage.ASK_DATE,
    Stage.ASK_TIME,
    Stage.ASK_PEOPLE,
    Stage.ASK_NAME,
    Stage.CONFIRMATION_PENDING,
    Stage.CONFIRMED,
}

ALLOWED_TRANSITIONS = {
    Stage.INIT: {Stage.ASK_DATE, Stage.ASK_TIME, Stage.ASK_PEOPLE, Stage.ASK_NAME, Stage.CONFIRMATION_PENDING, Stage.DONE},
    Stage.ASK_DATE: {Stage.ASK_TIME, Stage.ASK_PEOPLE, Stage.ASK_NAME, Stage.CONFIRMATION_PENDING, Stage.DONE},
    Stage.ASK_TIME: {Stage.ASK_DATE, Stage.ASK_PEOPLE, Stage.ASK_NAME, Stage.CONFIRMATION_PENDING, Stage.DONE},
    Stage.ASK_PEOPLE: {Stage.ASK_DATE, Stage.ASK_TIME, Stage.ASK_NAME, Stage.CONFIRMATION_PENDING, Stage.DONE},
    Stage.ASK_NAME: {Stage.ASK_DATE, Stage.ASK_TIME, Stage.ASK_PEOPLE, Stage.CONFIRMATION_PENDING, Stage.DONE},
    Stage.CONFIRMATION_PENDING: {Stage.ASK_DATE, Stage.ASK_TIME, Stage.ASK_PEOPLE, Stage.ASK_NAME, Stage.CONFIRMED, Stage.DONE},
    Stage.CONFIRMED: {Stage.DONE},
    Stage.DONE: {Stage.INIT, Stage.ASK_DATE, Stage.ASK_TIME, Stage.ASK_PEOPLE, Stage.ASK_NAME, Stage.CONFIRMATION_PENDING},
}

FIELD_PROMPTS = {
    "date": "¿Para qué fecha quieres la reserva?",
    "time": "¿A qué hora deseas reservar?",
    "people": "¿Para cuántas personas?",
    "name": "¿A nombre de quién hago la reserva?",
}


def _transition(state: ConversationState, to_stage: Stage, reason: str) -> bool:
    if state.stage == to_stage:
        state.last_transition = f"{state.stage.value}->{to_stage.value}:{reason}"
        return True

    allowed = ALLOWED_TRANSITIONS.get(state.stage, set())
    if to_stage not in allowed:
        state.last_transition = f"INVALID:{state.stage.value}->{to_stage.value}:{reason}"
        return False

    state.last_transition = f"{state.stage.value}->{to_stage.value}:{reason}"
    state.stage = to_stage
    return True


def _clear_critical_flow(state: ConversationState) -> None:
    state.confirmation_token = None
    state.pending_operation_id = None
    state.critical_flow = False
    state.reask_count = 0
    state.last_prompted_field = None


def _reset_reservation_for_new_flow(state: ConversationState) -> None:
    state.reservation.date = None
    state.reservation.time = None
    state.reservation.people = None
    state.reservation.name = None
    state.reservation.notes = None
    _clear_critical_flow(state)
    _transition(state, Stage.INIT, "reset_new_reservation_flow")


def _missing_fields(state: ConversationState) -> List[str]:
    reservation = state.reservation
    missing = []
    for field in REQUIRED_FIELDS:
        if getattr(reservation, field) in (None, ""):
            missing.append(field)
    return missing


def _reservation_signature(state: ConversationState) -> str:
    payload = {
        "session_id": state.session_id,
        "reservation": {
            "date": state.reservation.date,
            "time": state.reservation.time,
            "people": state.reservation.people,
            "name": state.reservation.name,
            "notes": state.reservation.notes,
        },
    }
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


def _operation_id(state: ConversationState) -> str:
    base = f"{state.session_id}:{_reservation_signature(state)}:{state.pending_action or 'append_row'}"
    return hashlib.sha256(base.encode("utf-8")).hexdigest()[:32]


def _build_confirmation(state: ConversationState) -> str:
    reservation = state.reservation
    return (
        "Confírmame por favor: "
        f"reserva para {reservation.people} personas, "
        f"el {reservation.date} a las {reservation.time}, "
        f"a nombre de {reservation.name}. "
        "Responde 'sí' para confirmar o indica qué dato cambiar."
    )


def _next_stage_for_field(field_name: str) -> Stage:
    if field_name == "date":
        return Stage.ASK_DATE
    if field_name == "time":
        return Stage.ASK_TIME
    if field_name == "people":
        return Stage.ASK_PEOPLE
    return Stage.ASK_NAME


def _ask_for_field(state: ConversationState, field_name: str, reason: str, flags: List[str]) -> ActionOutput:
    if state.last_prompted_field == field_name:
        state.reask_count += 1
    else:
        state.reask_count = 0

    state.last_prompted_field = field_name
    target_stage = _next_stage_for_field(field_name)
    if not _transition(state, target_stage, reason):
        return ActionOutput(
            action=ActionType.ERROR,
            assistant_message="No pude mantener un estado válido de la conversación. Intenta nuevamente con una sola frase.",
            state=state,
            reason="invalid_fsm_transition",
            guardrail_flags=[*flags, "invalid_fsm_transition"],
        )

    if state.reask_count > state.max_reasks:
        return ActionOutput(
            action=ActionType.ERROR,
            assistant_message=(
                "No logro completar los datos de forma confiable. "
                "¿Podrías reenviar la reserva en una sola frase con fecha, hora, personas y nombre?"
            ),
            state=state,
            reason="loop_breaker_triggered",
            guardrail_flags=[*flags, "loop_breaker_triggered"],
        )

    return ActionOutput(
        action=ActionType.ASK_MISSING,
        assistant_message=FIELD_PROMPTS[field_name],
        state=state,
        reason=reason,
        guardrail_flags=flags,
    )


def _critical_flow_required(state: ConversationState, extraction_intent: str, has_updates: bool) -> bool:
    if state.stage in ACTIVE_CRITICAL_STAGES:
        return True
    if extraction_intent in {"reserve", "update", "confirm_yes", "confirm_no"}:
        return True
    return has_updates


def plan_and_execute(data: PlannerInput) -> ActionOutput:
    state = data.state
    state.turn += 1

    message = data.message.strip()
    if not message:
        return ActionOutput(
            action=ActionType.ERROR,
            assistant_message="Necesito un mensaje para continuar.",
            state=state,
            reason="empty_message",
        )

    allowed, flags, guardrail_message = check_privacy_guardrails(message)
    if not allowed:
        return ActionOutput(
            action=ActionType.ERROR,
            assistant_message=guardrail_message,
            state=state,
            reason="privacy_guardrail",
            guardrail_flags=flags,
        )

    extraction = extract(message, state.reservation)

    if state.stage == Stage.DONE and (extraction.intent in {"reserve", "update"} or extraction.reservation_updates):
        _reset_reservation_for_new_flow(state)

    state.critical_flow = _critical_flow_required(state, extraction.intent, bool(extraction.reservation_updates))

    # Estado fuerte: acumulamos extracción sin perder campos válidos previos.
    for key, value in extraction.reservation_updates.items():
        setattr(state.reservation, key, value)

    normalized = normalize_text(message)
    if state.last_user_message == normalized and not extraction.reservation_updates:
        state.reask_count += 1
    state.last_user_message = normalized

    if state.stage == Stage.CONFIRMED and state.pending_operation_id:
        if state.pending_operation_id in state.committed_operation_ids:
            _transition(state, Stage.DONE, "already_committed")
            return ActionOutput(
                action=ActionType.CONFIRM,
                assistant_message=f"Listo {state.reservation.name}, tu reserva ya estaba confirmada.",
                state=state,
                reason="idempotent_already_committed",
                guardrail_flags=[*flags, "idempotent_commit"],
            )

        payload = {
            "operation": state.pending_action or "append_row",
            "operation_id": state.pending_operation_id,
            "confirmation_token": state.confirmation_token,
            "data": asdict(state.reservation),
            "session_id": state.session_id,
        }
        return ActionOutput(
            action=ActionType.APPEND_ROW,
            assistant_message="Estoy cerrando tu reserva en el sistema, un momento.",
            state=state,
            tool_payload=payload,
            reason="write_pending_retry",
            guardrail_flags=[*flags, "write_pending_retry"],
        )

    if state.stage == Stage.CONFIRMATION_PENDING:
        if extraction.has_affirmation:
            op_id = _operation_id(state)
            state.confirmation_token = _reservation_signature(state)[:16]
            state.pending_operation_id = op_id

            if op_id in state.committed_operation_ids:
                _transition(state, Stage.DONE, "confirmed_already_committed")
                return ActionOutput(
                    action=ActionType.CONFIRM,
                    assistant_message=f"Listo {state.reservation.name}, tu reserva ya estaba confirmada.",
                    state=state,
                    reason="idempotent_confirm",
                    guardrail_flags=[*flags, "idempotent_confirm"],
                )

            if not _transition(state, Stage.CONFIRMED, "user_confirmed"):
                return ActionOutput(
                    action=ActionType.ERROR,
                    assistant_message="No pude completar la confirmación por un estado inválido. Intenta nuevamente.",
                    state=state,
                    reason="invalid_fsm_transition",
                    guardrail_flags=[*flags, "invalid_fsm_transition"],
                )

            payload = {
                "operation": state.pending_action or "append_row",
                "operation_id": op_id,
                "confirmation_token": state.confirmation_token,
                "data": asdict(state.reservation),
                "session_id": state.session_id,
            }
            return ActionOutput(
                action=ActionType.APPEND_ROW,
                assistant_message=f"Listo {state.reservation.name}, tu reserva está confirmada.",
                state=state,
                tool_payload=payload,
                reason="confirmed_and_ready_to_write",
                guardrail_flags=flags,
            )

        if extraction.has_rejection or extraction.reservation_updates:
            missing = _missing_fields(state)
            if missing:
                return _ask_for_field(state, missing[0], "confirmation_rejected_missing_data", flags)

            return ActionOutput(
                action=ActionType.CONFIRM,
                assistant_message=_build_confirmation(state),
                state=state,
                reason="confirmation_rebuilt_after_edit",
                guardrail_flags=flags,
            )

        return ActionOutput(
            action=ActionType.ASK_MISSING,
            assistant_message="Responde 'sí' para confirmar o dime qué dato deseas cambiar.",
            state=state,
            reason="awaiting_confirmation",
            guardrail_flags=[*flags, "confirmation_pending"],
        )

    missing_fields = _missing_fields(state)
    if missing_fields:
        return _ask_for_field(state, missing_fields[0], "missing_required_field", flags)

    state.confirmation_token = _reservation_signature(state)[:16]
    if not _transition(state, Stage.CONFIRMATION_PENDING, "all_fields_present"):
        return ActionOutput(
            action=ActionType.ERROR,
            assistant_message="No pude preparar la confirmación por un estado inválido. Intenta nuevamente.",
            state=state,
            reason="invalid_fsm_transition",
            guardrail_flags=[*flags, "invalid_fsm_transition"],
        )

    return ActionOutput(
        action=ActionType.CONFIRM,
        assistant_message=_build_confirmation(state),
        state=state,
        reason="all_fields_present_request_confirmation",
        guardrail_flags=flags,
    )

