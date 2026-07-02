import pytest
from api import adx_signal

test_data = [
    (10, 5, 5, "HOLD"),
    (10, 25, 20, "HOLD"),
    (30, 25, 20, "BUY"),
    (30, 5, 5, "HOLD"),
    (30, 5, 25, "SELL"),
]


@pytest.mark.parametrize("adx,plus_di,minus_di,expected", test_data)
def test_adx_signal_cacc(adx, plus_di, minus_di, expected):
    assert adx_signal(adx, plus_di, minus_di) == expected

    '''pytest.mark — специјален дел од pytest за "означување" (marking) на тестови со дополнителни инструкции
    .parametrize(...) — конкретната инструкција: "изврши ја оваа тест функција повеќе пати, секој пат со различни вредности"
    "adx,plus_di,minus_di,expected" — string кој ги именува параметрите (мора точно да одговараат на имињата во листата параметри на функцијата подолу)
    test_data — самата листа со податоци што ја дефиниравме погоре'''
