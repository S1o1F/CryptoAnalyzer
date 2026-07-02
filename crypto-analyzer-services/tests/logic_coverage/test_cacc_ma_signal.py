import pytest
from api import ma_signal


test_data = [
    (100, 90, "BUY"),               # c1=F c2=F -> P1=F (base)
    (float('nan'), 30, "HOLD"),      # c1=F c2=T -> P1=T  (price=NaN, ma=30 razlicno od base)
    (50, float('nan'), "HOLD"),      # c1=T c2=F -> P1=T  (ma=NaN, price=50 razlicno od base)
]


@pytest.mark.parametrize("price,ma,expected", test_data)
def test_ma_signal_cacc(price, ma, expected):
    assert ma_signal(price, ma) == expected