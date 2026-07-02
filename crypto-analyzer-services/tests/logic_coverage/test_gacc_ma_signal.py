import pytest
from api import ma_signal


def test_gacc_ma_signal():
    # c1 (isna(ma)) affects result
    assert ma_signal(100, float('nan')) == "HOLD"    # c1=T c2=F -> P1=True -> HOLD
    assert ma_signal(110, 100) == "BUY"                 # c1=F c2=F -> P1=False -> price>ma -> BUY

    # c2 (isna(price)) affects result
    assert ma_signal(float('nan'), 90) == "HOLD"       # c1=F c2=T -> P1=True -> HOLD
    assert ma_signal(90, 100) == "SELL"                   # c1=F c2=F -> P1=False -> price<ma -> SELL


if __name__ == "__main__":
    pytest.main([__file__, "-v"])