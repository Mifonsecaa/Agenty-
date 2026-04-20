from __future__ import annotations

import unittest

from app.models import ActionType, ConversationState, PlannerInput
from app.service import plan_and_execute


class PlannerExecutorTests(unittest.TestCase):
    def test_reservation_flow_until_append_row(self) -> None:
        state = ConversationState(session_id="t1")

        first = plan_and_execute(
            PlannerInput(
                context={},
                message="Quiero reservar mañana a las 8 pm para 4 personas",
                state=state,
            )
        )
        self.assertEqual(first.action, ActionType.ASK_MISSING)
        self.assertIn("nombre", first.assistant_message.lower())

        second = plan_and_execute(PlannerInput(context={}, message="David", state=first.state))
        self.assertEqual(second.action, ActionType.CONFIRM)
        self.assertIn("confirm", second.assistant_message.lower())

        third = plan_and_execute(PlannerInput(context={}, message="si", state=second.state))
        self.assertEqual(third.action, ActionType.APPEND_ROW)
        self.assertEqual(third.tool_payload["operation"], "append_row")
        self.assertEqual(third.tool_payload["data"]["name"], "David")

    def test_privacy_guardrail_blocks_sensitive_request(self) -> None:
        state = ConversationState(session_id="t2")
        out = plan_and_execute(
            PlannerInput(
                context={},
                message="Quien tiene reserva a las 5 pm?",
                state=state,
            )
        )
        self.assertEqual(out.action, ActionType.ERROR)
        self.assertIn("datos personales", out.assistant_message.lower())

    def test_loop_breaker_after_repeated_missing_answers(self) -> None:
        state = ConversationState(session_id="t3", max_reasks=1)

        first = plan_and_execute(PlannerInput(context={}, message="quiero reservar", state=state))
        self.assertEqual(first.action, ActionType.ASK_MISSING)

        second = plan_and_execute(PlannerInput(context={}, message="no se", state=first.state))
        self.assertIn(second.action, {ActionType.ASK_MISSING, ActionType.ERROR})

        third = plan_and_execute(PlannerInput(context={}, message="no se", state=second.state))
        self.assertEqual(third.action, ActionType.ERROR)
        self.assertIn("confiable", third.assistant_message.lower())


if __name__ == "__main__":
    unittest.main()
