import requests
from datetime import datetime, timedelta

# Import Observer pattern components
from observer_pattern import get_crypto_data_subject


def update_missing_data(conn, symbol: str, last_date: str, session: requests.Session = None):
    sess = session or requests.Session()
    cursor = conn.cursor()

    if last_date is None:
        return

    start_date = datetime.strptime(last_date, "%Y-%m-%d") + timedelta(days=1)
    start_ts = int(start_date.timestamp() * 1000)

    ohlcv_data = _download_new_klines(sess, symbol, start_ts)
    if len(ohlcv_data) == 0:
        return

    url_24h = "https://api.binance.com/api/v3/ticker/24hr"
    try:
        r = sess.get(url_24h, params={"symbol": symbol}, timeout=20)
        r.raise_for_status()
        stats_24h = r.json()
    except Exception:
        stats_24h = {}

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
        print(f"[F3] {symbol}: inserted {len(rows)} new rows.")
        
        # ============================================================
        # OBSERVER PATTERN: Notify observers of data update
        # ============================================================
        # Following the Observer pattern from slides 1-11, 22-27
        # When data is updated, notify all registered observers:
        # - CacheInvalidatorObserver: Invalidates symbols cache
        # - AnalyticsLoggerObserver: Logs analytics data
        # - PriceAlertObserver: Checks for price alerts
        # ============================================================
        
        # Prepare update data for observers (extract price information)
        update_data = []
        for row in rows:
            # row format: (symbol, date, open, high, low, close, volume, 
            #              last_price, high_24h, low_24h, volume_24h, liquidity)
            update_data.append({
                'symbol': row[0],
                'date': row[1],
                'open': row[2],
                'high': row[3],
                'low': row[4],
                'close': row[5],
                'volume': row[6],
                'last_price': row[7]
            })
        
        # Get the global subject and notify observers
        subject = get_crypto_data_subject()
        subject.data_updated(symbol, len(rows), update_data)


def _download_new_klines(session, symbol: str, start_ts: int):
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