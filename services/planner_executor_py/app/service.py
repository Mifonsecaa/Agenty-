from __future__ import annotations

from dataclasses import asdict
from typing import List

from .extractor import extract, normalize_text
from .models import ActionOutput, ActionType, ConversationState, PlannerInput, Stage
from .policy import check_privacy_guardrails

REQUIRED_FIELDS = ["date", "time", "people", "name"]


FIELD_PROMPTS = {
    "date": "¿Para qué fecha quieres la reserva?",
    "time": "¿A qué hora deseas reservar?",
    "people": "¿Para cuántas personas?",
    "name": "¿A nombre de quién hago la reserva?",
}


def _missing_fields(state: ConversationState) -> List[str]:
    reservation = state.reservation
    missing = []
    for field in REQUIRED_FIELDS:
        if getattr(reservation, field) in (None, ""):
            missing.append(field)
    return missing


def _build_confirmation(state: ConversationState) -> str:
    reservation = state.reservation
    return (
        "Confírmame por favor: "
        f"reserva para {reservation.people} personas, "
        f"el {reservation.date} a las {reservation.time}, "
        f"a nombre de {reservation.name}. "
        "Responde 'sí' para confirmar o indica qué dato cambiar."
    )


def _ask_for_field(state: ConversationState, field_name: str, reason: str, flags: List[str]) -> ActionOutput:
    if state.last_prompted_field == field_name:
        state.reask_count += 1
    else:
        state.reask_count = 0

    state.last_prompted_field = field_name
    state.stage = Stage[f"ASK_{field_name.upper()}"]

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

    # Estado fuerte: siempre acumulamos extracción al estado actual.
    for key, value in extraction.reservation_updates.items():
        setattr(state.reservation, key, value)

    normalized = normalize_text(message)
    if state.last_user_message == normalized and not extraction.reservation_updates:
        state.reask_count += 1
    state.last_user_message = normalized

    if state.stage == Stage.CONFIRMATION_PENDING:
        if extraction.has_affirmation:
            state.stage = Stage.CONFIRMED
            payload = {
                "operation": state.pending_action or "append_row",
                "data": asdict(state.reservation),
                "session_id": state.session_id,
            }
            state.stage = Stage.DONE
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
            state.stage = Stage.CONFIRMATION_PENDING
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

    state.stage = Stage.CONFIRMATION_PENDING
    return ActionOutput(
        action=ActionType.CONFIRM,
        assistant_message=_build_confirmation(state),
        state=state,
        reason="all_fields_present_request_confirmation",
        guardrail_flags=flags,
    )

