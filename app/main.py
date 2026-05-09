"""PassGen Pro – FastAPI application."""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, Form, HTTPException, Request, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
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
    HistoryItem,
    HistoryResponse,
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
    title="PassGen Pro",
    version=__version__,
    description="Secure password generator with FastAPI + SQLite (REST API + UI).",
    lifespan=lifespan,
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _strength_dto_from_password(password: str) -> StrengthDTO:
    return StrengthDTO(**check_strength(password).to_dict())


def _initial_context(request: Request) -> dict:
    """Default context for the home page on first load (no password yet)."""
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
# JSON REST API (/api/*)
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
    return _strength_dto_from_password(payload.password)


@app.get("/api/history", response_model=HistoryResponse, tags=["api"])
def api_history(limit: int = 50, offset: int = 0) -> HistoryResponse:
    limit = max(1, min(limit, 200))
    offset = max(0, offset)
    items = db.get_history(limit=limit, offset=offset)
    return HistoryResponse(
        total=db.history_count(),
        items=[HistoryItem(**{**i, **{
            "use_lowercase": bool(i["use_lowercase"]),
            "use_uppercase": bool(i["use_uppercase"]),
            "use_digits": bool(i["use_digits"]),
            "use_symbols": bool(i["use_symbols"]),
            "entropy_bits": float(i.get("entropy_bits") or 0.0),
        }}) for i in items],
    )


@app.delete("/api/history", tags=["api"])
def api_clear_history():
    removed = db.clear_history()
    return {"removed": removed}


@app.delete("/api/history/{item_id}", tags=["api"])
def api_delete_history(item_id: int):
    ok = db.delete_history_item(item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"removed": 1}


@app.get("/api/health", tags=["meta"])
def api_health():
    return {"status": "ok", "version": __version__}


# ---------------------------------------------------------------------------
# Server-side rendered pages (HTML)
# ---------------------------------------------------------------------------
@app.get("/", response_class=HTMLResponse, tags=["pages"])
def index(request: Request):
    return templates.TemplateResponse(request, "index.html", _initial_context(request))


@app.post("/generate", response_class=HTMLResponse, tags=["pages"])
def generate_form(
    request: Request,
    length: int = Form(DEFAULT_LENGTH),
    lowercase: Optional[str] = Form(None),
    uppercase: Optional[str] = Form(None),
    digits: Optional[str] = Form(None),
    symbols: Optional[str] = Form(None),
):
    """SSR fallback for users with JS disabled."""
    use_lower = lowercase == "on"
    use_upper = uppercase == "on"
    use_dig = digits == "on"
    use_sym = symbols == "on"
    ctx = _initial_context(request)
    ctx.update(
        length=length,
        use_lowercase=use_lower,
        use_uppercase=use_upper,
        use_digits=use_dig,
        use_symbols=use_sym,
        summary=type_summary(use_lower, use_upper, use_dig, use_sym),
    )
    try:
        password = generate_password(
            length=length,
            use_lowercase=use_lower,
            use_uppercase=use_upper,
            use_digits=use_dig,
            use_symbols=use_sym,
        )
    except GeneratorError as exc:
        ctx["error"] = str(exc)
        return templates.TemplateResponse(request, "index.html", ctx, status_code=400)

    strength = check_strength(password)
    db.save_password(
        password=password,
        length=length,
        use_lowercase=use_lower,
        use_uppercase=use_upper,
        use_digits=use_dig,
        use_symbols=use_sym,
        type_summary=ctx["summary"],
        strength_label=strength.label,
        strength_score=strength.score,
        entropy_bits=strength.entropy_bits,
    )
    ctx.update(password=password, strength=strength)
    return templates.TemplateResponse(request, "index.html", ctx)


@app.get("/history", response_class=HTMLResponse, tags=["pages"])
def history_page(request: Request):
    items = db.get_history(limit=200)
    return templates.TemplateResponse(
        request,
        "history.html",
        {
            "version": __version__,
            "items": items,
            "count": len(items),
        },
    )


@app.post("/history/clear", tags=["pages"])
def history_clear_form():
    db.clear_history()
    return RedirectResponse(url="/history", status_code=303)
