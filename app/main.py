"""PassGen — FastAPI приложение (каркас)."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import HTMLResponse

from . import __version__

app = FastAPI(
    title="PassGen",
    version=__version__,
    description="Генератор паролей. Каркас FastAPI приложения.",
)


@app.get("/", response_class=HTMLResponse)
async def index() -> str:
    return (
        "<!doctype html><html lang='ru'><head><meta charset='utf-8'>"
        "<title>PassGen</title></head><body>"
        "<h1>PassGen</h1>"
        "<p>Генератор паролей. Скоро здесь появится форма.</p>"
        f"<p><small>v{__version__}</small></p>"
        "</body></html>"
    )


@app.get("/api/health", tags=["api"])
def api_health() -> dict:
    return {"status": "ok", "version": __version__}
