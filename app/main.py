"""PassGen — FastAPI: каркас + генерация + оценка надёжности."""
from __future__ import annotations

from fastapi import FastAPI, HTTPException, status
from fastapi.responses import HTMLResponse

from . import __version__
from .generator import (
    DEFAULT_LENGTH,
    MAX_LENGTH,
    MIN_LENGTH,
    GeneratorError,
    generate_password,
    type_summary,
)
from .strength import check_strength

app = FastAPI(
    title="PassGen",
    version=__version__,
    description="Генератор паролей с оценкой надёжности (REST API).",
)


@app.get("/", response_class=HTMLResponse)
async def index() -> str:
    return (
        "<!doctype html><html lang='ru'><head><meta charset='utf-8'>"
        "<title>PassGen</title></head><body>"
        "<h1>PassGen</h1>"
        "<p>UI ещё не готов. REST API уже работает:</p>"
        "<ul>"
        "<li><code>POST /api/generate</code> — пароль + оценка надёжности</li>"
        "<li><code>POST /api/check</code> — оценка переданного пароля</li>"
        "<li><code>GET /api/health</code> — проверка статуса</li>"
        "</ul>"
        f"<p><small>v{__version__}</small></p>"
        "</body></html>"
    )


@app.post("/api/generate", tags=["api"])
def api_generate(
    length: int = DEFAULT_LENGTH,
    use_lowercase: bool = True,
    use_uppercase: bool = True,
    use_digits: bool = True,
    use_symbols: bool = True,
) -> dict:
    try:
        password = generate_password(
            length=length,
            use_lowercase=use_lowercase,
            use_uppercase=use_uppercase,
            use_digits=use_digits,
            use_symbols=use_symbols,
        )
    except GeneratorError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    strength = check_strength(password)
    return {
        "password": password,
        "length": length,
        "type_summary": type_summary(use_lowercase, use_uppercase, use_digits, use_symbols),
        "strength": strength.to_dict(),
        "limits": {"min_length": MIN_LENGTH, "max_length": MAX_LENGTH},
    }


@app.post("/api/check", tags=["api"])
def api_check(password: str) -> dict:
    return check_strength(password).to_dict()


@app.get("/api/health", tags=["api"])
def api_health() -> dict:
    return {"status": "ok", "version": __version__}
