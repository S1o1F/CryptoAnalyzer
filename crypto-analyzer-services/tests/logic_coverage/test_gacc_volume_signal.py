import pytest
from api import volume_signal


def test_gacc_volume_signal():
    # c1 (isna(current_vol)) affects result
    assert volume_signal(float('nan'), 500) == "HOLD"    # c1=T c2=F -> P1=True -> HOLD
    assert volume_signal(1000, 500) == "BUY"                # c1=F c2=F -> P1=False -> 1000>750 -> BUY

    # c2 (isna(vol_ma)) affects result
    assert volume_signal(1000, float('nan')) == "HOLD"     # c1=F c2=T -> P1=True -> HOLD
    assert volume_signal(800, 500) == "BUY"                    # c1=F c2=F -> P1=False -> 800>750 -> BUY


if __name__ == "__main__":
    pytest.main([__file__, "-v"])