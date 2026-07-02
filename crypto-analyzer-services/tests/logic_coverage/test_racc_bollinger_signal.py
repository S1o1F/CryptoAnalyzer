import pytest
from api import bollinger_signal


class TestBollingerSignalRACC:

    def test_base_all_valid(self):
        """c1=F c2=F c3=F -> P1=False."""
        assert bollinger_signal(100, 90, 110) == "HOLD"

    def test_c1_lower_is_nan(self):
        """c1=T c2=F c3=F -> P1=True -> HOLD"""
        assert bollinger_signal(100, float('nan'), 110) == "HOLD"

    def test_c2_upper_is_nan(self):
        """c1=F c2=T c3=F -> P1=True -> HOLD"""
        assert bollinger_signal(100, 90, float('nan')) == "HOLD"

    def test_c3_price_is_nan(self):
        """c1=F c2=F c3=T -> P1=True -> HOLD"""
        assert bollinger_signal(float('nan'), 90, 110) == "HOLD"
