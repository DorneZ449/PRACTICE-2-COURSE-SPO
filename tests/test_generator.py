import string

import pytest

from app.generator import (
    GeneratorError,
    MAX_LENGTH,
    MIN_LENGTH,
    generate_password,
    type_summary,
)


def test_default_password_length():
    pw = generate_password()
    assert len(pw) == 16


@pytest.mark.parametrize("length", [6, 12, 24, 32, 64])
def test_explicit_length(length):
    pw = generate_password(length=length)
    assert len(pw) == length


def test_includes_each_selected_class():
    pw = generate_password(
        length=16,
        use_lowercase=True,
        use_uppercase=True,
        use_digits=True,
        use_symbols=True,
    )
    assert any(c.islower() for c in pw)
    assert any(c.isupper() for c in pw)
    assert any(c.isdigit() for c in pw)
    assert any(c in "!@#$%^&*()-_=+[]{};:,.<>?/" for c in pw)


def test_only_digits_when_others_disabled():
    pw = generate_password(
        length=10,
        use_lowercase=False,
        use_uppercase=False,
        use_digits=True,
        use_symbols=False,
    )
    assert len(pw) == 10
    assert set(pw).issubset(set(string.digits))


def test_at_least_one_class_required():
    with pytest.raises(GeneratorError):
        generate_password(
            length=10,
            use_lowercase=False,
            use_uppercase=False,
            use_digits=False,
            use_symbols=False,
        )


def test_length_too_short_for_classes():
    with pytest.raises(GeneratorError):
        generate_password(length=2)


@pytest.mark.parametrize("length", [MIN_LENGTH - 1, MAX_LENGTH + 1, 0, -1])
def test_length_bounds(length):
    with pytest.raises(GeneratorError):
        generate_password(length=length)


def test_uniqueness_high_entropy():
    samples = {generate_password(length=24) for _ in range(50)}
    assert len(samples) == 50  # cryptographic generator should not repeat


def test_type_summary():
    assert type_summary(True, True, True, True) == "A-Z, a-z, 0-9, symbols"
    assert type_summary(True, False, False, False) == "a-z"
    assert type_summary(False, False, False, False) == "none"
