"""Cryptographically-secure password generator."""

from __future__ import annotations

import secrets
import string
from typing import Dict, List

#: Character sets used for password generation.
CHARSETS: Dict[str, str] = {
    "lowercase": string.ascii_lowercase,
    "uppercase": string.ascii_uppercase,
    "digits": string.digits,
    "symbols": "!@#$%^&*()-_=+[]{};:,.<>?/",
}

MIN_LENGTH = 6
MAX_LENGTH = 64           # hard upper bound accepted by the REST API
UI_MAX_LENGTH = 32        # slider upper bound in the web UI (per the spec)
DEFAULT_LENGTH = 16


class GeneratorError(ValueError):
    """Raised when password generation parameters are invalid."""


def generate_password(
    length: int = DEFAULT_LENGTH,
    *,
    use_lowercase: bool = True,
    use_uppercase: bool = True,
    use_digits: bool = True,
    use_symbols: bool = True,
) -> str:
    """Generate a password using a cryptographically-secure RNG.

    The generator guarantees that at least one character from every selected
    character set appears in the result, then fills the remaining positions
    from the union of all selected sets and finally shuffles the result.
    """
    if not isinstance(length, int):
        raise GeneratorError("Password length must be an integer.")
    if length < MIN_LENGTH or length > MAX_LENGTH:
        raise GeneratorError(
            f"Password length must be between {MIN_LENGTH} and {MAX_LENGTH}."
        )

    selected: List[str] = []
    if use_lowercase:
        selected.append(CHARSETS["lowercase"])
    if use_uppercase:
        selected.append(CHARSETS["uppercase"])
    if use_digits:
        selected.append(CHARSETS["digits"])
    if use_symbols:
        selected.append(CHARSETS["symbols"])

    if not selected:
        raise GeneratorError("Select at least one character type.")

    # Guarantee at least one char from every selected category, then fill the
    # rest from the union of the selected sets and shuffle the result so the
    # mandatory chars do not leak their position.
    chars = [secrets.choice(charset) for charset in selected]
    union = "".join(selected)
    while len(chars) < length:
        chars.append(secrets.choice(union))
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)


def type_summary(
    use_lowercase: bool,
    use_uppercase: bool,
    use_digits: bool,
    use_symbols: bool,
) -> str:
    """Return a short label describing selected character classes."""
    labels: List[str] = []
    if use_uppercase:
        labels.append("A-Z")
    if use_lowercase:
        labels.append("a-z")
    if use_digits:
        labels.append("0-9")
    if use_symbols:
        labels.append("symbols")
    return ", ".join(labels) if labels else "none"
