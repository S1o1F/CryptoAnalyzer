import pytest
from api import ma_signal

class TestMaSignalGACC:

    def test_c1_true_context_a(self):
        """c1=True (ma=NaN), c2=False (price=100) c1 determines P1."""
        assert ma_signal(100, float('nan')) == "HOLD"

    def test_c1_false_context_b(self):
        """c1=False (ma=250), c2=False (price=300) c1 determines P1 """
        assert ma_signal(300, 250) == "BUY"

    def test_c2_true_context_c(self):
        """c1=False (ma=90), c2=True (price=NaN)
        c2 determines P1"""
        assert ma_signal(float('nan'), 90) == "HOLD"

    def test_c2_false_context_d(self):
        """c2=False (price=45), c1=False (ma=45) c2 determines P1"""
        assert ma_signal(45, 45) == "HOLD"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])