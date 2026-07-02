import pytest
from api import bollinger_signal


test_data = [
    (100, 90, 110, "HOLD"),                        # c1=F c2=F c3=F -> P1=F (base)
    (80, float('nan'), 150, "HOLD"),                  # c1=F c2=T c3=F -> P1=T (upper=150, price=80, razlicni od base)
    (float('nan'), 40, 60, "HOLD"),                    # c1=F c2=F c3=T -> P1=T (lower=40, upper=60, razlicni od base)
    (30, 20, float('nan'), "HOLD"),                     # c1=T c2=F c3=F -> P1=T (upper=20, price=30, razlicni od base)
]


@pytest.mark.parametrize("price,lower,upper,expected", test_data)
def test_bollinger_signal_cacc(price, lower, upper, expected):
    assert bollinger_signal(price, lower, upper) == expected