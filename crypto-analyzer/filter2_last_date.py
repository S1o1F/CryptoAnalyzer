import requests
from datetime import datetime, timedelta


def check_last_date(conn, symbol: str, session: requests.Session = None):
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS crypto_data (
            symbol TEXT,
            date TEXT,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            volume REAL,
            last_price REAL,
            high_24h REAL,
            low_24h REAL,
            volume_24h REAL,
            liquidity REAL,
            PRIMARY KEY(symbol, date)
        )
        """
    )

    cursor.execute("SELECT MAX(date) FROM crypto_data WHERE symbol = ?", (symbol,))
    result = cursor.fetchone()[0]

    if result:
        return result

    _fetch_initial_data(conn, symbol, session)
    return None


def _download_klines(session, symbol: str, start_ts: int):
    url = "https://api.binance.com/api/v3/klines"
    interval = "1d"
    limit = 1000

    all_candles = []
    current_start = start_ts

    while True:
        params = {
            "symbol": symbol,
            "interval": interval,
            "limit": limit,
            "startTime": current_start,
        }
        r = session.get(url, params=params, timeout=20)
        r.raise_for_status()
        chunk = r.json()
        if not chunk:
            break
        all_candles.extend(chunk)
        if len(chunk) < limit:
            break
        last_open_time = chunk[-1][0]
        current_start = last_open_time + 1

    return all_candles


def _fetch_initial_data(conn, symbol: str, session: requests.Session = None):
    sess = session or requests.Session()

    start_date = datetime.utcnow() - timedelta(days=365 * 10)
    start_ts = int(start_date.timestamp() * 1000)

    try:
        ohlcv_data = _download_klines(sess, symbol, start_ts)
    except Exception as e:
        print(f"[F2] {symbol}: failed to download initial OHLCV: {e}")
        return

    if len(ohlcv_data) == 0:
        print(f"[F2] {symbol}: no OHLCV data, skipping.")
        return

    url_24h = "https://api.binance.com/api/v3/ticker/24hr"
    try:
        r = sess.get(url_24h, params={"symbol": symbol}, timeout=20)
        r.raise_for_status()
        stats_24h = r.json()
    except Exception:
        stats_24h = {}

    cursor = conn.cursor()
    rows = []

    for candle in ohlcv_data:
        open_time = candle[0]
        date = datetime.utcfromtimestamp(open_time / 1000).strftime("%Y-%m-%d")
        open_ = float(candle[1])
        high = float(candle[2])
        low = float(candle[3])
        close = float(candle[4])
        volume = float(candle[5])

        last_price = float(stats_24h.get("lastPrice", close)) if stats_24h else close
        high_24h = float(stats_24h.get("highPrice", high)) if stats_24h else high
        low_24h = float(stats_24h.get("lowPrice", low)) if stats_24h else low
        volume_24h = float(stats_24h.get("volume", volume)) if stats_24h else volume
        liquidity = float(stats_24h.get("quoteVolume", 0)) if stats_24h else 0.0

        rows.append(
            (
                symbol,
                date,
                open_,
                high,
                low,
                close,
                volume,
                last_price,
                high_24h,
                low_24h,
                volume_24h,
                liquidity,
            )
        )

    if rows:
        cursor.executemany(
            """
            INSERT OR IGNORE INTO crypto_data
            (symbol, date, open, high, low, close, volume,
             last_price, high_24h, low_24h, volume_24h, liquidity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            rows,
        )
        conn.commit()
        print(f"[F2] {symbol}: inserted {len(rows)} initial rows.")