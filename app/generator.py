"""Генерация паролей."""
import random
import string


def generate_password(length=12, use_lower=True, use_upper=True,
                      use_digits=True, use_special=True):
    """Генерирует пароль заданной длины из выбранных групп символов."""
    chars = ""
    if use_lower:
        chars += string.ascii_lowercase
    if use_upper:
        chars += string.ascii_uppercase
    if use_digits:
        chars += string.digits
    if use_special:
        chars += "!@#$%^&*()"

    # если ничего не выбрано, ставим хотя бы строчные буквы
    if not chars:
        chars = string.ascii_lowercase

    return "".join(random.choice(chars) for _ in range(length))
