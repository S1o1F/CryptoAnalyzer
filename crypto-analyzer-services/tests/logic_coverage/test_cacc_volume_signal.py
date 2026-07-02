import pytest
from api import volume_signal

test_data = [
    (1000, 500, "BUY"),                        # c1=F c2=F -> P1=F (base)
    (float('nan'), 200, "HOLD"),                 # c1=T c2=F -> P1=T  (vol_ma=200, razlicno od base 500)
    (300, float('nan'), "HOLD"),                  # c1=F c2=T -> P1=T  (current_vol=300, razlicno od base 1000)
]


@pytest.mark.parametrize("current_vol,vol_ma,expected", test_data)
def test_volume_signal_cacc(current_vol, vol_ma, expected):
    assert volume_signal(current_vol, vol_ma) == expected