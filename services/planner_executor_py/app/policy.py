from __future__ import annotations

from typing import List, Tuple

from .extractor import normalize_text


SENSITIVE_PATTERNS = [
    "quien tiene reserva",
    "quien reservo",
    "nombre del cliente",
    "lista de clientes",
    "dame los clientes",
    "telefono de",
]


def check_privacy_guardrails(message: str) -> Tuple[bool, List[str], str]:
    normalized = normalize_text(message)
    flags: List[str] = []

    if any(pattern in normalized for pattern in SENSITIVE_PATTERNS):
        flags.append("privacy_blocked")
        return (
            False,
            flags,
            "No puedo compartir datos personales de otros clientes. Puedo ayudarte con tu propia reserva.",
        )

    return True, flags, ""

