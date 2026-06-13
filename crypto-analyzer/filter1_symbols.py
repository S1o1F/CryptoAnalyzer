import csv
import os
import requests

ALLOWED_QUOTES = {"USDT", "USDC", "BUSD", "USD"}
MIN_VOLUME_USD = 1_000_000
TOP_LIMIT = 1000


def _fetch_exchange_info(session: requests.Session):
    url = "https://api.binance.com/api/v3/exchangeInfo"
    r = session.get(url, timeout=20)
    r.raise_for_status()
    data = r.json()

    info_map = {}
    for s in data.get("symbols", []):
        symbol = s.get("symbol")
        base = s.get("baseAsset")
        quote = s.get("quoteAsset")
        status = s.get("status")
        if not symbol or not base or not quote:
            continue
        info_map[symbol] = {
            "base": base,
            "quote": quote,
            "status": status,
        }
    return info_map


def _fetch_24h_tickers(session: requests.Session):
    url = "https://api.binance.com/api/v3/ticker/24hr"
    r = session.get(url, timeout=20)
    r.raise_for_status()
    data = r.json()
    tickers = {}
    for row in data:
        symbol = row.get("symbol")
        if not symbol:
            continue
        tickers[symbol] = row
    return tickers


def get_top_symbols(output_csv_path: str, limit: int = TOP_LIMIT):
    session = requests.Session()

    exchange_info = _fetch_exchange_info(session)
    tickers = _fetch_24h_tickers(session)

    valid_rows = []
    for symbol, t in tickers.items():
        info = exchange_info.get(symbol)
        if not info:
            continue

        if info["status"] != "TRADING":
            continue

        quote = info["quote"]
        if quote not in ALLOWED_QUOTES:
            continue

        try:
            quote_volume = float(t.get("quoteVolume", 0.0))
        except (TypeError, ValueError):
            quote_volume = 0.0

        if quote_volume < MIN_VOLUME_USD:
            continue

        valid_rows.append(
            {
                "symbol": symbol,
                "base": info["base"],
                "quote": info["quote"],
                "quote_volume": quote_volume,
            }
        )

    valid_rows.sort(key=lambda r: r["quote_volume"], reverse=True)
    valid_rows = valid_rows[:limit]

    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    with open(output_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["symbol", "base", "quote", "quote_volume"],
        )
        writer.writeheader()
        writer.writerows(valid_rows)

    print(f"[F1] Saved {len(valid_rows)} valid Binance pairs")
    return [row["symbol"] for row in valid_rows]