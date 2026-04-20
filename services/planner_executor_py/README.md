# Planner + Executor (Python)

Microservicio para decidir acciones de reservas sin tool-calling ambiguo.

## Objetivo

Recibe:
- `context`
- `message`
- `state`

Devuelve un JSON determinista con una de estas acciones:
- `ask_missing`
- `confirm`
- `append_row`
- `update_cell`
- `error`

## Anti-ciclos implementado

- FSM estricta con etapas (`INIT`, `ASK_DATE`, `ASK_TIME`, `ASK_PEOPLE`, `ASK_NAME`, `CONFIRMATION_PENDING`, `DONE`).
- Extracción determinista por reglas (fecha/hora/personas/nombre).
- Confirmación explícita antes de `append_row`.
- Loop breaker con `max_reasks`.
- Guardrail de privacidad para no revelar datos de terceros.
- Idempotencia con `operation_id` para evitar dobles escrituras por reintentos.
- Modo crítico de reserva (`critical_flow`) para que el canal evite fallback genérico.

## Estructura

- `app/models.py`: contratos de entrada/salida y serialización.
- `app/extractor.py`: parser determinista y normalización.
- `app/policy.py`: guardrails de privacidad.
- `app/service.py`: FSM + planner/executor.
- `app/main.py`: API Flask.
- `run_demo.py`: runner local sin levantar servidor.
- `tests/test_service.py`: pruebas unitarias.

## Ejecutar local

```bash
python -m pip install -r requirements.txt
python run_demo.py
```

## Levantar API

```bash
python -m flask --app app.main run --host=0.0.0.0 --port=8010
```

## Probar endpoint

```bash
curl -X POST "http://localhost:8010/v1/plan-execute" \
  -H "Content-Type: application/json" \
  -d '{"context":{},"message":"Quiero reservar mañana a las 8 pm para 4 personas","state":{"session_id":"wsp-123","stage":"INIT","reservation":{}}}'
```

## Tests

```bash
python -m unittest discover -s tests -p "test_*.py" -v
```
