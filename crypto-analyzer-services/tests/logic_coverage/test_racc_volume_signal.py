import pytest
from api import volume_signal

class TestVolumeSignalRACC:

    def test_base_both_valid(self):
        """c1=F c2=F -> P1=False.
        current_vol=1000, vol_ma=500 -> 1000 > 500*1.5=750 -> True -> BUY"""
        assert volume_signal(1000, 500) == "BUY"

    def test_c1_current_vol_is_nan(self):
        """c1=T c2=F -> P1=True -> HOLD"""
        assert volume_signal(float('nan'), 500) == "HOLD"

    def test_c2_vol_ma_is_nan(self):
        """c1=F c2=T -> P1=True -> HOLD"""
        assert volume_signal(1000, float('nan')) == "HOLD"