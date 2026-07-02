import pytest
from api import ma_signal


class TestMaSignalRACC:

    def test_base_both_valid(self):
        """c1=F c2=F -> P1=False, price(100)>ma(90) -> BUY"""
        assert ma_signal(100, 90) == "BUY"

    def test_c1_ma_is_nan(self):
        """c1=T c2=F -> P1=True -> HOLD"""
        assert ma_signal(100, float('nan')) == "HOLD"

    def test_c2_price_is_nan(self):
        """c1=F c2=T -> P1=True -> HOLD"""
        assert ma_signal(float('nan'), 90) == "HOLD"