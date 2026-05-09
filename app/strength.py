"""Password strength estimation."""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass
from typing import Dict

from .generator import CHARSETS

MAX_SCORE = 7


@dataclass(frozen=True)
class StrengthResult:
    """Result of a password strength assessment."""

    label: str           # Weak | Medium | Strong | Very Strong
    css_class: str       # weak | medium | strong | very-strong
    color: str           # hex color used by the UI
    score: int           # 0..MAX_SCORE
    percent: int         # 0..100, used for progress bar width
    entropy_bits: float  # estimated entropy in bits
    description: str     # human-readable hint

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


def _category_pool_size(password: str) -> int:
    """Estimate the size of the symbol pool the password draws from."""
    pool = 0
    if any(c.islower() for c in password):
        pool += len(CHARSETS["lowercase"])
    if any(c.isupper() for c in password):
        pool += len(CHARSETS["uppercase"])
    if any(c.isdigit() for c in password):
        pool += len(CHARSETS["digits"])
    if any(c in CHARSETS["symbols"] for c in password):
        pool += len(CHARSETS["symbols"])
    if not pool:
        pool = max(1, len(set(password)))
    return pool


def estimate_entropy(password: str) -> float:
    """Approximate Shannon-style entropy in bits."""
    if not password:
        return 0.0
    pool = _category_pool_size(password)
    return round(len(password) * math.log2(pool), 2)


def check_strength(password: str) -> StrengthResult:
    """Compute a 0..MAX_SCORE password strength score.

    Score breakdown:
      - +1 if length >= 8, +1 if >= 12, +1 if >= 16
      - +1 per character category present (lower / upper / digits / symbols)
    """
    if not password:
        return StrengthResult(
            label="Weak",
            css_class="weak",
            color="#EF4444",
            score=0,
            percent=0,
            entropy_bits=0.0,
            description="Empty password.",
        )

    score = 0
    length = len(password)
    if length >= 8:
        score += 1
    if length >= 12:
        score += 1
    if length >= 16:
        score += 1

    categories = sum(
        (
            any(c.islower() for c in password),
            any(c.isupper() for c in password),
            any(c.isdigit() for c in password),
            any(c in CHARSETS["symbols"] for c in password),
        )
    )
    score += categories
    score = min(score, MAX_SCORE)

    entropy = estimate_entropy(password)

    if score <= 2:
        return StrengthResult(
            label="Weak",
            css_class="weak",
            color="#EF4444",
            score=score,
            percent=20,
            entropy_bits=entropy,
            description="Use more characters and add different symbol types.",
        )
    if score <= 4:
        return StrengthResult(
            label="Medium",
            css_class="medium",
            color="#F59E0B",
            score=score,
            percent=55,
            entropy_bits=entropy,
            description="Good start, but a longer password with more types is safer.",
        )
    if score <= 6:
        return StrengthResult(
            label="Strong",
            css_class="strong",
            color="#22C55E",
            score=score,
            percent=80,
            entropy_bits=entropy,
            description="Several character groups and a safe length.",
        )
    return StrengthResult(
        label="Very Strong",
        css_class="very-strong",
        color="#22C55E",
        score=score,
        percent=100,
        entropy_bits=entropy,
        description="Excellent length and character diversity. Safe to use.",
    )
