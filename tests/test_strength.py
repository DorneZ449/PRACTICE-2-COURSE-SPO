from app.strength import check_strength, estimate_entropy


def test_empty_password_is_weak():
    s = check_strength("")
    assert s.label == "Weak"
    assert s.score == 0
    assert s.percent == 0


def test_short_only_lowercase_is_weak():
    s = check_strength("abcdef")
    assert s.label == "Weak"
    assert s.score <= 2


def test_medium_password():
    s = check_strength("abcd1234")
    assert s.label == "Medium"


def test_strong_password():
    s = check_strength("Hello12345!")
    assert s.label == "Strong"


def test_very_strong_password():
    s = check_strength("M7K5r;JM!q3X8aB#")
    assert s.label == "Very Strong"
    assert s.percent == 100
    assert s.entropy_bits > 60


def test_entropy_increases_with_pool():
    assert estimate_entropy("aaaaaa") < estimate_entropy("aB3#kLm9")
