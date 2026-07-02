import pytest
from api import bollinger_signal


def test_gacc_bollinger_signal():
    # c1 (isna(lower)) affects result
    assert bollinger_signal(100, float('nan'), 110) == "HOLD"   # c1=T c2=F c3=F
    assert bollinger_signal(100, 90, 110) == "HOLD"              # c1=F c2=F c3=F

    # c2 (isna(upper)) affects result
    assert bollinger_signal(100, 90, float('nan')) == "HOLD"     # c1=F c2=T c3=F
    assert bollinger_signal(100, 90, 110) == "HOLD"                # c1=F c2=F c3=F

    # c3 (isna(price)) affects result
    assert bollinger_signal(float('nan'), 90, 110) == "HOLD"      # c1=F c2=F c3=T
    assert bollinger_signal(100, 90, 110) == "HOLD"                 # c1=F c2=F c3=F