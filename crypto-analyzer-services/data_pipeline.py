import os
import time
import sqlite3
from concurrent.futures import ThreadPoolExecutor, as_completed

from filter1_symbols import get_top_symbols
from filter2_last_date import check_last_date
from filter3_update import update_missing_data


DB_PATH = "database/data.db"
MAX_WORKERS = 20


def init_database():
    os.makedirs("database", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("PRAGMA journal_mode = WAL;")
    cursor.execute("PRAGMA synchronous = OFF;")
    cursor.execute("PRAGMA temp_store = MEMORY;")
    cursor.execute("PRAGMA cache_size = 100000;")

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
    conn.commit()
    conn.close()


def process_symbol(symbol: str):
    import sqlite3
    import requests

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode = WAL;")
    cursor.execute("PRAGMA synchronous = OFF;")
    cursor.execute("PRAGMA temp_store = MEMORY;")
    cursor.execute("PRAGMA cache_size = 100000;")

    session = requests.Session()

    try:
        last_date = check_last_date(conn, symbol, session)
        update_missing_data(conn, symbol, last_date, session)
    finally:
        conn.close()


def check_database():
    if not os.path.exists(DB_PATH):
        print("[DB] Database file not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("[DB] Tables:", tables)

    cursor.execute("SELECT COUNT(*) FROM crypto_data;")
    total_rows = cursor.fetchone()[0]
    print(f"[DB] Total rows: {total_rows}")

    cursor.execute("SELECT * FROM crypto_data LIMIT 5;")
    rows = cursor.fetchall()
    for row in rows:
        print(row)

    conn.close()


def main():
    start_time = time.time()

    init_database()

    symbols = get_top_symbols("data/symbols.csv", limit=1000)
    print(f"[F1] Valid Binance symbols: {len(symbols)}")

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(process_symbol, s) for s in symbols]
        for _ in as_completed(futures):
            pass

    check_database()

    end_time = time.time()
    print(f"[TIMER] Total time: {end_time - start_time:.2f} seconds")


if __name__ == "__main__":
    main()