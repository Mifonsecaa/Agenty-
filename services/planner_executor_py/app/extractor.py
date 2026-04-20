from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from typing import Dict, Optional

from .models import Reservation


AFFIRMATIVE_WORDS = {"si", "sí", "ok", "dale", "confirmo", "correcto", "yes", "de acuerdo", "listo"}
NEGATIVE_WORDS = {"no", "negativo", "cancela", "cancela", "mejor no"}
RESERVATION_WORDS = {"reserva", "reservar", "agendar", "apartar", "mesa"}
UPDATE_WORDS = {"cambia", "cambiar", "modifica", "editar", "actualiza"}


@dataclass
class ExtractionResult:
    intent: str = "unknown"
    reservation_updates: Dict[str, object] = field(default_factory=dict)
    has_affirmation: bool = False
    has_rejection: bool = False


def normalize_text(text: str) -> str:
    lowered = text.lower().strip()
    return "".join(
        c for c in unicodedata.normalize("NFD", lowered) if unicodedata.category(c) != "Mn"
    )


def _extract_time(normalized: str) -> Optional[str]:
    match_24 = re.search(r"\b([01]?\d|2[0-3])[:.]([0-5]\d)\b", normalized)
    if match_24:
        return f"{int(match_24.group(1)):02d}:{match_24.group(2)}"

    match_12 = re.search(r"\b(1[0-2]|[1-9])\s*(am|pm)\b", normalized)
    if match_12:
        hour = int(match_12.group(1))
        suffix = match_12.group(2)
        if suffix == "pm" and hour != 12:
            hour += 12
        if suffix == "am" and hour == 12:
            hour = 0
        return f"{hour:02d}:00"

    return None


def _extract_people(normalized: str) -> Optional[int]:
    patterns = [
        r"\b(\d{1,2})\s*(personas|persona|pax|comensales?)\b",
        r"\bpara\s+(\d{1,2})\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, normalized)
        if match:
            return int(match.group(1))
    return None


def _extract_name(raw_text: str, normalized: str, current_name: Optional[str]) -> Optional[str]:
    if normalized in AFFIRMATIVE_WORDS or normalized in NEGATIVE_WORDS:
        return None

    patterns = [
        r"a nombre de\s+([a-zA-Z\s]{2,40})",
        r"me llamo\s+([a-zA-Z\s]{2,40})",
        r"soy\s+([a-zA-Z\s]{2,40})",
    ]
    for pattern in patterns:
        match = re.search(pattern, normalized)
        if match:
            candidate = match.group(1).strip(" .,;:-")
            return candidate.title()

    compact = raw_text.strip()
    # If a name is already set, avoid overriding it with short free-text replies.
    if current_name and len(compact.split()) <= 2:
        return None

    if 2 <= len(compact) <= 40 and re.fullmatch(r"[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+", compact):
        return compact.title()
    return None


def _extract_date(normalized: str) -> Optional[str]:
    if "manana" in normalized:
        return "mañana"
    if "hoy" in normalized:
        return "hoy"

    match = re.search(r"\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b", normalized)
    if match:
        day = int(match.group(1))
        month = int(match.group(2))
        year = match.group(3) or ""
        if year:
            return f"{day:02d}/{month:02d}/{year}"
        return f"{day:02d}/{month:02d}"

    return None


def extract(message: str, current_reservation: Reservation) -> ExtractionResult:
    normalized = normalize_text(message)
    tokens = set(normalized.split())

    result = ExtractionResult()
    result.has_affirmation = bool(tokens & AFFIRMATIVE_WORDS) or normalized in AFFIRMATIVE_WORDS
    result.has_rejection = bool(tokens & NEGATIVE_WORDS) or normalized in NEGATIVE_WORDS

    has_reservation_keyword = any(word in normalized for word in RESERVATION_WORDS)
    has_update_keyword = any(word in normalized for word in UPDATE_WORDS)

    if has_update_keyword:
        result.intent = "update"
    elif has_reservation_keyword:
        result.intent = "reserve"
    elif result.has_affirmation:
        result.intent = "confirm_yes"
    elif result.has_rejection:
        result.intent = "confirm_no"

    extracted_time = _extract_time(normalized)
    if extracted_time:
        result.reservation_updates["time"] = extracted_time

    extracted_people = _extract_people(normalized)
    if extracted_people is not None:
        result.reservation_updates["people"] = extracted_people

    extracted_date = _extract_date(normalized)
    if extracted_date:
        result.reservation_updates["date"] = extracted_date

    extracted_name = _extract_name(message, normalized, current_reservation.name)
    if extracted_name and extracted_name != current_reservation.name:
        result.reservation_updates["name"] = extracted_name

    return result

