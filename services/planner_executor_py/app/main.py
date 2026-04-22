from __future__ import annotations

from flask import Flask, jsonify, request

from .models import ActionOutput, ActionType, PlannerInput
from .service import plan_and_execute

app = Flask(__name__)


@app.get("/healthz")
def healthz() -> tuple:
    return jsonify({"status": "ok"}), 200


@app.get("/readyz")
def readyz() -> tuple:
    return jsonify({"status": "ready"}), 200


@app.post("/v1/plan-execute")
def plan_execute() -> tuple:
    payload_data = request.get_json(silent=True) or {}

    try:
        payload = PlannerInput.from_dict(payload_data)
        result = plan_and_execute(payload)
        return jsonify(result.to_dict()), 200
    except Exception as exc:  # noqa: BLE001
        fallback_payload = PlannerInput.from_dict(payload_data)
        fallback = ActionOutput(
            action=ActionType.ERROR,
            assistant_message=(
                "Ocurrió un problema técnico al procesar la solicitud. "
                "Intenta nuevamente en unos segundos."
            ),
            state=fallback_payload.state,
            reason=f"unhandled_exception:{type(exc).__name__}",
            guardrail_flags=["exception_caught"],
        )
        return jsonify(fallback.to_dict()), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8010, debug=True)
