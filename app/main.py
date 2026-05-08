"""FastAPI-приложение «Генератор паролей»."""
from pathlib import Path

from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.generator import generate_password

BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(title="Генератор паролей")

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Главная страница с формой."""
    return templates.TemplateResponse(
        request, "index.html", {"password": ""}
    )


@app.post("/", response_class=HTMLResponse)
async def index_post(
    request: Request,
    length: int = Form(12),
    use_lower: str = Form(None),
    use_upper: str = Form(None),
    use_digits: str = Form(None),
    use_special: str = Form(None),
):
    """Сгенерировать пароль и показать его на странице."""
    password = generate_password(
        length=length,
        use_lower=use_lower == "on",
        use_upper=use_upper == "on",
        use_digits=use_digits == "on",
        use_special=use_special == "on",
    )
    return templates.TemplateResponse(
        request, "index.html", {"password": password, "length": length}
    )
