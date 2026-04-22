from __future__ import annotations

import json

from app.models import ConversationState, PlannerInput
from app.service import plan_and_execute


def run_demo() -> None:
    state = ConversationState(session_id="demo-123")

    conversation = [
        "Quiero reservar mañana a las 8 pm para 4 personas",
        "David",
        "si",
    ]

    for idx, user_message in enumerate(conversation, start=1):
        payload = PlannerInput(context={"channel": "whatsapp"}, message=user_message, state=state)
        response = plan_and_execute(payload)
        state = response.state

        print(f"\nTurno {idx}")
        print(f"Usuario: {user_message}")
        print(f"Accion: {response.action.value}")
        print(f"Asistente: {response.assistant_message}")
        if response.tool_payload:
            print("tool_payload:")
            print(json.dumps(response.tool_payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    run_demo()

