import sqlite3
import json
import os
from datetime import datetime

DB_PATH = "database/data.db"
JSON_OUTPUT = "prototype/data/crypto_data.json"


def export_database_to_json():
    if not os.path.exists(DB_PATH):
        print(f"[ERROR] Базата не постои: {DB_PATH}")
        print("[INFO] Прво изврши: python data_pipeline.py")
        return False
    
    print(f"[INFO] Читање од база: {DB_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DISTINCT symbol 
        FROM crypto_data 
        ORDER BY symbol
    """)
    symbols = [row[0] for row in cursor.fetchall()]
    print(f"[INFO] Пронајдени {len(symbols)} криптовалути")

    data = {
        "symbols": [],
        "price_history": {},
        "market_stats": {
            "total_market_cap": 0,
            "total_volume_24h": 0,
            "btc_dominance": 52.1,
            "eth_dominance": 17.8,
            "active_cryptocurrencies": len(symbols),
            "markets": 820
        }
    }
    
    total_volume = 0
    
    total_symbols = len(symbols)
    for idx, symbol in enumerate(symbols):  # СИТЕ криптовалути
        print(f"[PROGRESS] {idx + 1}/{total_symbols} - {symbol}")
        cursor.execute("""
            SELECT date, open, high, low, close, volume, 
                   last_price, high_24h, low_24h, volume_24h, liquidity
            FROM crypto_data
            WHERE symbol = ?
            ORDER BY date DESC
        """, (symbol,))  # СИТЕ податоци (без LIMIT)
        
        rows = cursor.fetchall()
        
        if not rows:
            continue

        base = symbol.replace("USDT", "").replace("USDC", "").replace("BUSD", "")
        quote = "USDT" if "USDT" in symbol else ("USDC" if "USDC" in symbol else "BUSD")

        latest = rows[0]
        quote_volume = latest[9] if latest[9] else latest[5] * latest[4]  # volume_24h или volume * close

        data["symbols"].append({
            "symbol": symbol,
            "base": base,
            "quote": quote,
            "name": get_crypto_name(base),
            "quote_volume": quote_volume
        })
        
        total_volume += quote_volume
        
        # Организирај по месеци
        monthly_data = {}
        for row in reversed(rows):
            date_str = row[0]  # Format: YYYY-MM-DD
            month_key = date_str[:7]  # YYYY-MM
            
            if month_key not in monthly_data:
                monthly_data[month_key] = []
            
            monthly_data[month_key].append({
                "date": row[0],
                "open": row[1],
                "high": row[2],
                "low": row[3],
                "close": row[4],
                "volume": row[5],
                "last_price": row[6] if row[6] else row[4],
                "high_24h": row[7] if row[7] else row[2],
                "low_24h": row[8] if row[8] else row[3],
                "volume_24h": row[9] if row[9] else row[5],
                "liquidity": row[10] if row[10] else 0
            })
        
        data["price_history"][symbol] = monthly_data

    data["market_stats"]["total_volume_24h"] = total_volume
    data["market_stats"]["total_market_cap"] = total_volume * 25  # Приближна проценка

    data["symbols"].sort(key=lambda x: x["quote_volume"], reverse=True)
    
    conn.close()

    os.makedirs(os.path.dirname(JSON_OUTPUT), exist_ok=True)
    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Статистики
    total_records = sum(len(h) for h in data["price_history"].values())
    file_size = os.path.getsize(JSON_OUTPUT) / (1024 * 1024)  # MB
    
    print("=" * 50)
    print(f"[SUCCESS] Извоз завршен!")
    print(f"  - Криптовалути: {len(data['symbols'])}")
    print(f"  - Вкупно записи: {total_records:,}")
    print(f"  - Големина на фајл: {file_size:.2f} MB")
    print(f"  - Локација: {JSON_OUTPUT}")
    print("=" * 50)
    return True


def get_crypto_name(base):
    names = {
        "BTC": "Bitcoin",
        "ETH": "Ethereum",
        "BNB": "Binance Coin",
        "SOL": "Solana",
        "XRP": "XRP",
        "ADA": "Cardano",
        "DOGE": "Dogecoin",
        "DOT": "Polkadot",
        "MATIC": "Polygon",
        "SHIB": "Shiba Inu",
        "LTC": "Litecoin",
        "AVAX": "Avalanche",
        "LINK": "Chainlink",
        "UNI": "Uniswap",
        "ATOM": "Cosmos",
        "XLM": "Stellar",
        "ETC": "Ethereum Classic",
        "FIL": "Filecoin",
        "NEAR": "NEAR Protocol",
        "APT": "Aptos",
        "ARB": "Arbitrum",
        "OP": "Optimism",
        "SUI": "Sui",
        "INJ": "Injective",
        "TIA": "Celestia",
        "SEI": "Sei",
        "PEPE": "Pepe",
        "WIF": "dogwifhat",
        "BONK": "Bonk",
        "FLOKI": "Floki",
    }
    return names.get(base, base)


if __name__ == "__main__":
    print("=" * 50)
    print("  Извоз на податоци од база во JSON")
    print("=" * 50)
    export_database_to_json()

