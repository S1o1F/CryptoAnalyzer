import pytest
from api import adx_signal


def test_gacc_adx_signal():
    # c1 (adx>25) affects result
    assert adx_signal(30, 40, 20) == "BUY"     # c1=T c2=T c3=F
    assert adx_signal(20, 40, 20) == "HOLD"    # c1=F c2=T c3=F

    # c2 (plus_di>minus_di) affects result
    assert adx_signal(30, 40, 20) == "BUY"     # c1=T c2=T c3=F
    assert adx_signal(30, 20, 20) == "HOLD"    # c1=T c2=F c3=F

    # c3 (minus_di>plus_di) affects result
    assert adx_signal(30, 5, 20) == "SELL"     # c1=T c2=F c3=T
    assert adx_signal(30, 5, 5) == "HOLD"      # c1=T c2=F c3=F