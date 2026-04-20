from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class Stage(str, Enum):
    INIT = "INIT"
    ASK_DATE = "ASK_DATE"
    ASK_TIME = "ASK_TIME"
    ASK_PEOPLE = "ASK_PEOPLE"
    ASK_NAME = "ASK_NAME"
    CONFIRMATION_PENDING = "CONFIRMATION_PENDING"
    CONFIRMED = "CONFIRMED"
    DONE = "DONE"


class ActionType(str, Enum):
    ASK_MISSING = "ask_missing"
    CONFIRM = "confirm"
    APPEND_ROW = "append_row"
    UPDATE_CELL = "update_cell"
    ERROR = "error"


@dataclass
class Reservation:
    date: Optional[str] = None
    time: Optional[str] = None
    people: Optional[int] = None
    name: Optional[str] = None
    notes: Optional[str] = None


@dataclass
class ConversationState:
    session_id: str = ""
    stage: Stage = Stage.INIT
    reservation: Reservation = field(default_factory=Reservation)
    pending_action: Optional[str] = "append_row"
    turn: int = 0
    reask_count: int = 0
    last_prompted_field: Optional[str] = None
    max_reasks: int = 2
    last_user_message: Optional[str] = None
    confirmation_token: Optional[str] = None
    pending_operation_id: Optional[str] = None
    committed_operation_ids: List[str] = field(default_factory=list)
    critical_flow: bool = False
    last_transition: Optional[str] = None

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> "ConversationState":
        reservation_data = data.get("reservation", {})
        reservation = Reservation(
            date=reservation_data.get("date"),
            time=reservation_data.get("time"),
            people=reservation_data.get("people"),
            name=reservation_data.get("name"),
            notes=reservation_data.get("notes"),
        )
        stage_value = data.get("stage", Stage.INIT.value)
        stage = Stage(stage_value)
        return ConversationState(
            session_id=data.get("session_id", ""),
            stage=stage,
            reservation=reservation,
            pending_action=data.get("pending_action", "append_row"),
            turn=int(data.get("turn", 0)),
            reask_count=int(data.get("reask_count", 0)),
            last_prompted_field=data.get("last_prompted_field"),
            max_reasks=int(data.get("max_reasks", 2)),
            last_user_message=data.get("last_user_message"),
            confirmation_token=data.get("confirmation_token"),
            pending_operation_id=data.get("pending_operation_id"),
            committed_operation_ids=[
                str(x)
                for x in (data.get("committed_operation_ids") or [])
                if isinstance(x, (str, int, float)) and str(x).strip()
            ][:50],
            critical_flow=bool(data.get("critical_flow", False)),
            last_transition=data.get("last_transition"),
        )

    def to_dict(self) -> Dict[str, Any]:
        state = asdict(self)
        state["stage"] = self.stage.value
        return state


@dataclass
class PlannerInput:
    context: Dict[str, Any]
    message: str
    state: ConversationState

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> "PlannerInput":
        return PlannerInput(
            context=data.get("context", {}),
            message=str(data.get("message", "")),
            state=ConversationState.from_dict(data.get("state", {})),
        )


@dataclass
class ActionOutput:
    action: ActionType
    assistant_message: str
    state: ConversationState
    tool_payload: Dict[str, Any] = field(default_factory=dict)
    reason: str = ""
    guardrail_flags: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "action": self.action.value,
            "assistant_message": self.assistant_message,
            "state": self.state.to_dict(),
            "tool_payload": self.tool_payload,
            "reason": self.reason,
            "guardrail_flags": self.guardrail_flags,
        }
