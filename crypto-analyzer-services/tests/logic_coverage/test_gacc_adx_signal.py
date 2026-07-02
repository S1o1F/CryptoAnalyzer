import pytest
from api import adx_signal


class TestAdxSignalGACC:
    def test_c1_true_context_a(self):
        """c1=True (adx=30),
        (plus_di=40>minus_di=20 -> c2=T, c3=F).
        (c2 OR c3)=True,  c1 determines P2."""
        assert adx_signal(30, 40, 20) == "BUY"

    def test_c1_false_context_b(self):
        """c1=False (adx=15),
        plus_di=10<minus_di=50
        -> c2=F, c3=T. (c2 OR c3)=True
        c1 determines P2 """
        assert adx_signal(15, 10, 50) == "HOLD"

    def test_c2_true_context_c(self):
        """c1=True (adx=30), c3=False (minus_di=10,
        plus_di=50 -> 10>50 e False), c2=True (50>10=True)
        -> P2=True. c2 determines P2"""
        assert adx_signal(30, 50, 10) == "BUY"

    def test_c2_false_context_d(self):
        """c1=True (adx=45), plus_di=5, minus_di=5
        -> c2=False (5>5=False), c3=False (5>5=False)
        -> P2=False. c2 determines P2 и тука"""
        assert adx_signal(45, 5, 5) == "HOLD"

    def test_c3_true_context_e(self):
        """c1=True (adx=26, само над границата),
        c2=False (plus_di=3, minus_di=20 -> 3>20=False),
        c3=True (20>3=True) -> P2=True. c3 determines P2"""
        assert adx_signal(26, 3, 20) == "SELL"

    def test_c3_false_context_f(self):
        """c1=True (adx=99), plus_di=1, minus_di=1
        -> c2=False (1>1=False), c3=False (1>1=False)
        -> P2=False. c3 determines P2"""
        assert adx_signal(99, 1, 1) == "HOLD"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])