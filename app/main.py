"""PassGen — FastAPI: генерация + надёжность + история в SQLite."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.responses import HTMLResponse

from . import __version__, db
from .generator import (
    DEFAULT_LENGTH,
    MAX_LENGTH,
    MIN_LENGTH,
    GeneratorError,
    generate_password,
    type_summary,
)
from .schemas import (
    CheckRequest,
    GenerateRequest,
    GenerateResponse,
    StrengthDTO,
)
from .strength import check_strength


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(
    title="PassGen",
    version=__version__,
    description="Генератор паролей с историей в SQLite (REST API).",
    lifespan=lifespan,
)


@app.get("/", response_class=HTMLResponse)
async def index() -> str:
    return (
        "<!doctype html><html lang='ru'><head><meta charset='utf-8'>"
        "<title>PassGen</title></head><body>"
        "<h1>PassGen</h1>"
        "<p>UI ещё не готов. REST API уже работает:</p>"
        "<ul>"
        "<li><code>POST /api/generate</code> — пароль + оценка + сохранение в историю</li>"
        "<li><code>POST /api/check</code> — оценка переданного пароля</li>"
        "<li><code>GET /api/health</code> — проверка статуса</li>"
        "</ul>"
        f"<p><small>v{__version__}</small></p>"
        "</body></html>"
    )


@app.post("/api/generate", response_model=GenerateResponse, tags=["api"])
def api_generate(payload: GenerateRequest) -> GenerateResponse:
    try:
        password = generate_password(
            length=payload.length,
            use_lowercase=payload.use_lowercase,
            use_uppercase=payload.use_uppercase,
            use_digits=payload.use_digits,
            use_symbols=payload.use_symbols,
        )
    except GeneratorError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    strength = check_strength(password)
    summary = type_summary(
        payload.use_lowercase,
        payload.use_uppercase,
        payload.use_digits,
        payload.use_symbols,
    )

    saved_id: Optional[int] = None
    if payload.save:
        saved_id = db.save_password(
            password=password,
            length=payload.length,
            use_lowercase=payload.use_lowercase,
            use_uppercase=payload.use_uppercase,
            use_digits=payload.use_digits,
            use_symbols=payload.use_symbols,
            type_summary=summary,
            strength_label=strength.label,
            strength_score=strength.score,
            entropy_bits=strength.entropy_bits,
        )

    return GenerateResponse(
        password=password,
        length=payload.length,
        type_summary=summary,
        strength=StrengthDTO(**strength.to_dict()),
        saved_id=saved_id,
    )


@app.post("/api/check", response_model=StrengthDTO, tags=["api"])
def api_check(payload: CheckRequest) -> StrengthDTO:
    return StrengthDTO(**check_strength(payload.password).to_dict())


@app.get("/api/health", tags=["api"])
def api_health() -> dict:
    return {
        "status": "ok",
        "version": __version__,
        "history_count": db.history_count(),
    }
