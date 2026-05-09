"""PassGen — FastAPI: HTML-фронтенд через Jinja-шаблоны."""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Form, HTTPException, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

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

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(
    title="PassGen",
    version=__version__,
    description="Генератор паролей: REST API + UI на Jinja-шаблонах.",
    lifespan=lifespan,
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


def _initial_context(request: Request) -> dict:
    sample_password = generate_password(length=DEFAULT_LENGTH)
    strength = check_strength(sample_password)
    return {
        "request": request,
        "version": __version__,
        "password": sample_password,
        "length": DEFAULT_LENGTH,
        "min_length": MIN_LENGTH,
        "max_length": MAX_LENGTH,
        "use_lowercase": True,
        "use_uppercase": True,
        "use_digits": True,
        "use_symbols": True,
        "summary": type_summary(True, True, True, True),
        "strength": strength,
        "error": None,
    }


# ---------------------------------------------------------------------------
# UI (Jinja templates)
# ---------------------------------------------------------------------------
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", _initial_context(request))


@app.post("/generate", response_class=HTMLResponse)
async def generate_form(
    request: Request,
    length: int = Form(DEFAULT_LENGTH),
    uppercase: Optional[str] = Form(None),
    lowercase: Optional[str] = Form(None),
    digits: Optional[str] = Form(None),
    symbols: Optional[str] = Form(None),
):
    use_uppercase = uppercase is not None
    use_lowercase = lowercase is not None
    use_digits = digits is not None
    use_symbols = symbols is not None

    ctx = _initial_context(request)
    ctx.update(
        length=length,
        use_uppercase=use_uppercase,
        use_lowercase=use_lowercase,
        use_digits=use_digits,
        use_symbols=use_symbols,
    )
    try:
        password = generate_password(
            length=length,
            use_lowercase=use_lowercase,
            use_uppercase=use_uppercase,
            use_digits=use_digits,
            use_symbols=use_symbols,
        )
    except GeneratorError as exc:
        ctx["error"] = str(exc)
        return templates.TemplateResponse("index.html", ctx)

    summary = type_summary(use_lowercase, use_uppercase, use_digits, use_symbols)
    strength = check_strength(password)
    db.save_password(
        password=password,
        length=length,
        use_lowercase=use_lowercase,
        use_uppercase=use_uppercase,
        use_digits=use_digits,
        use_symbols=use_symbols,
        type_summary=summary,
        strength_label=strength.label,
        strength_score=strength.score,
        entropy_bits=strength.entropy_bits,
    )
    ctx.update(password=password, summary=summary, strength=strength)
    return templates.TemplateResponse("index.html", ctx)


# ---------------------------------------------------------------------------
# REST API
# ---------------------------------------------------------------------------
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
