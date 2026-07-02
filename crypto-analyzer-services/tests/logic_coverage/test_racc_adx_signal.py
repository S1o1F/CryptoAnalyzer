import pytest
from api import adx_signal


class TestAdxSignalRACC:

    def test1(self):
        """A=T B=T C=F -> BUY"""
        assert adx_signal(30, 40, 20) == "BUY"

    def test2(self):
        """A=F B=T C=F -> HOLD"""
        assert adx_signal(20, 40, 20) == "HOLD"

    def test3(self):
        """A=T B=F C=T -> SELL"""
        assert adx_signal(30, 20, 40) == "SELL"

    def test4(self):
        """A=T B=F C=F -> HOLD"""
        assert adx_signal(30, 20, 20) == "HOLD"