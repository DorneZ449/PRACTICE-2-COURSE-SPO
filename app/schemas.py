"""Pydantic schemas for the REST API."""

from __future__ import annotations

from pydantic import BaseModel, Field

from .generator import DEFAULT_LENGTH, MAX_LENGTH, MIN_LENGTH


class GenerateRequest(BaseModel):
    length: int = Field(DEFAULT_LENGTH, ge=MIN_LENGTH, le=MAX_LENGTH)
    use_lowercase: bool = True
    use_uppercase: bool = True
    use_digits: bool = True
    use_symbols: bool = True
    save: bool = True

    model_config = {
        "json_schema_extra": {
            "example": {
                "length": 16,
                "use_lowercase": True,
                "use_uppercase": True,
                "use_digits": True,
                "use_symbols": True,
                "save": True,
            }
        }
    }


class StrengthDTO(BaseModel):
    label: str
    css_class: str
    color: str
    score: int
    percent: int
    entropy_bits: float
    description: str


class GenerateResponse(BaseModel):
    password: str
    length: int
    type_summary: str
    strength: StrengthDTO
    saved_id: int | None = None


class CheckRequest(BaseModel):
    password: str = Field(..., max_length=512)


class HistoryItem(BaseModel):
    id: int
    password: str
    length: int
    use_lowercase: bool
    use_uppercase: bool
    use_digits: bool
    use_symbols: bool
    type_summary: str
    strength_label: str
    strength_score: int
    entropy_bits: float
    created_at: str


class HistoryResponse(BaseModel):
    total: int
    items: list[HistoryItem]
