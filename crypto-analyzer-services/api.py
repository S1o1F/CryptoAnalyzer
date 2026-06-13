from fastapi import APIRouter, HTTPException
import os
import sqlite3
import numpy as np
import pandas as pd
import joblib
import time
import requests

from sklearn.preprocessing import MinMaxScaler
from ta.momentum import RSIIndicator, StochasticOscillator
from ta.trend import MACD, ADXIndicator, CCIIndicator, SMAIndicator, EMAIndicator, WMAIndicator
from ta.volatility import BollingerBands

router = APIRouter()

DB_PATH = "database/data.db"
MODELS_DIR = "models"
SYMBOLS_PATH = "data/symbols.csv"

_symbols_cache = None
_symbols_cache_time = 0
CACHE_DURATION = 300

# ---------------------------------------------------
# Get all symbols
# ---------------------------------------------------
@router.get("/symbols")
def get_symbols():
    """Get list of all available cryptocurrency symbols from database"""
    global _symbols_cache, _symbols_cache_time
    
    current_time = time.time()
    if _symbols_cache is not None and (current_time - _symbols_cache_time) < CACHE_DURATION:
        return _symbols_cache
    
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=500, detail="Database not found")
    
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA cache_size=10000")
    conn.execute("PRAGMA temp_store=MEMORY")
    conn.execute("PRAGMA busy_timeout=30000")
    cursor = conn.cursor()
    
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_symbol ON crypto_data(symbol)")
        conn.commit()
        
        cursor.execute("""
            SELECT symbol 
            FROM crypto_data 
            WHERE symbol IS NOT NULL
            GROUP BY symbol
            ORDER BY symbol
            LIMIT 10000
        """)
        symbol_rows = cursor.fetchall()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")
    finally:
        conn.close()
    
    symbols = []
    for (symbol,) in symbol_rows:
        base = symbol.replace('USDT', '').replace('USDC', '')
        symbols.append({
            "symbol": symbol,
            "base": base,
            "quote": "USDT" if "USDT" in symbol else "USDC",
            "name": base,
            "quote_volume": 0
        })
    
    _symbols_cache = symbols
    _symbols_cache_time = current_time
    
    return symbols


@router.get("/symbols/{symbol}/latest")
def get_latest_price(symbol: str):
    """Get the latest price data for a symbol"""
    df = get_symbol_df(symbol)
    latest = df.iloc[-1]
    return {
        "symbol": symbol,
        "date": latest["date"],
        "open": float(latest["open"]),
        "high": float(latest["high"]),
        "low": float(latest["low"]),
        "close": float(latest["close"]),
        "volume": float(latest["volume"])
    }


# ---------------------------------------------------
# Database utility
# ---------------------------------------------------
def get_symbol_df(symbol: str) -> pd.DataFrame:
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=500, detail="Database not found")

    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql(
        """
        SELECT *
        FROM crypto_data
        WHERE symbol = ?
        ORDER BY date
        """,
        conn,
        params=(symbol,)
    )
    conn.close()

    if df.empty:
        raise HTTPException(status_code=404, detail="Symbol not found")

    return df


def resample_data(df: pd.DataFrame, timeframe: str) -> pd.DataFrame:
    """Resample OHLCV data to different timeframes"""
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)
    
    # Keep only numeric columns for resampling
    numeric_cols = ['open', 'high', 'low', 'close', 'volume']
    df_numeric = df[numeric_cols]
    
    if timeframe == "1w":
        # Resample to weekly
        resampled = df_numeric.resample('W').agg({
            'open': 'first',
            'high': 'max',
            'low': 'min',
            'close': 'last',
            'volume': 'sum'
        }).dropna()
    elif timeframe == "1m":
        # Resample to monthly (use 'M' for compatibility)
        try:
            resampled = df_numeric.resample('ME').agg({
                'open': 'first',
                'high': 'max',
                'low': 'min',
                'close': 'last',
                'volume': 'sum'
            }).dropna()
        except:
            # Fallback for older pandas versions
            resampled = df_numeric.resample('M').agg({
                'open': 'first',
                'high': 'max',
                'low': 'min',
                'close': 'last',
                'volume': 'sum'
            }).dropna()
    else:
        # Default: daily (no resampling needed)
        resampled = df_numeric
    
    resampled.reset_index(inplace=True)
    return resampled


# ---------------------------------------------------
# SIGNAL LOGIC (BUY / SELL / HOLD)
# ---------------------------------------------------
def rsi_signal(rsi):
    """RSI < 30 = oversold (BUY), RSI > 70 = overbought (SELL)"""
    if pd.isna(rsi):
        return "HOLD"
    if rsi < 30:
        return "BUY"
    elif rsi > 70:
        return "SELL"
    return "HOLD"


def macd_signal(macd_diff):
    """MACD line above signal = BUY, below = SELL"""
    if pd.isna(macd_diff):
        return "HOLD"
    if macd_diff > 0:
        return "BUY"
    elif macd_diff < 0:
        return "SELL"
    return "HOLD"


def stochastic_signal(stoch):
    """Stochastic < 20 = oversold (BUY), > 80 = overbought (SELL)"""
    if pd.isna(stoch):
        return "HOLD"
    if stoch < 20:
        return "BUY"
    elif stoch > 80:
        return "SELL"
    return "HOLD"


def adx_signal(adx, plus_di, minus_di):
    """ADX > 25 with +DI > -DI = BUY, +DI < -DI = SELL"""
    if pd.isna(adx) or pd.isna(plus_di) or pd.isna(minus_di):
        return "HOLD"
    if adx > 25:
        if plus_di > minus_di:
            return "BUY"
        elif minus_di > plus_di:
            return "SELL"
    return "HOLD"


def cci_signal(cci):
    """CCI < -100 = oversold (BUY), CCI > 100 = overbought (SELL)"""
    if pd.isna(cci):
        return "HOLD"
    if cci < -100:
        return "BUY"
    elif cci > 100:
        return "SELL"
    return "HOLD"


def ma_signal(price, ma):
    """Price above MA = BUY, below = SELL"""
    if pd.isna(ma) or pd.isna(price):
        return "HOLD"
    if price > ma:
        return "BUY"
    elif price < ma:
        return "SELL"
    return "HOLD"


def bollinger_signal(price, lower, upper):
    """Price below lower band = oversold (BUY), above upper = overbought (SELL)"""
    if pd.isna(lower) or pd.isna(upper) or pd.isna(price):
        return "HOLD"
    if price < lower:
        return "BUY"
    elif price > upper:
        return "SELL"
    return "HOLD"


def volume_signal(current_vol, vol_ma):
    """High volume with price action confirmation"""
    if pd.isna(current_vol) or pd.isna(vol_ma):
        return "HOLD"
    # Volume above average suggests confirmation of trend
    if current_vol > vol_ma * 1.5:
        return "BUY"  # Strong volume could indicate breakout
    return "HOLD"


# ---------------------------------------------------
# Technical Analysis (Microservice Integration)
# ---------------------------------------------------
@router.get("/analysis/{symbol}")
def technical_analysis(symbol: str, timeframe: str = "1d"):
    """
    Get technical analysis for a cryptocurrency.
    This endpoint delegates to the analysis-service microservice.
    
    Comprehensive technical analysis with 10 indicators:
    - 5 Oscillators: RSI, MACD, Stochastic, ADX, CCI
    - 5 Moving Averages: SMA, EMA, WMA, Bollinger Bands, Volume MA
    
    Timeframes: 1d (daily), 1w (weekly), 1m (monthly)
    """
    try:
        # Call the analysis microservice
        response = requests.get(
            f"{ANALYSIS_SERVICE_URL}/analysis/{symbol}",
            params={"timeframe": timeframe},
            timeout=10
        )
        response.raise_for_status()  # Raise exception for bad status codes
        return response.json()
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail=f"Analysis service is unavailable. Please ensure the analysis-service is running on {ANALYSIS_SERVICE_URL}"
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="Analysis service request timed out"
        )
    except requests.exceptions.HTTPError as e:
        # Forward the error from the microservice
        try:
            error_detail = e.response.json().get("detail", str(e))
        except:
            error_detail = str(e)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Analysis service error: {error_detail}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calling analysis service: {str(e)}"
        )


# ---------------------------------------------------
# Multi-Timeframe Analysis (Microservice Integration)
# ---------------------------------------------------
@router.get("/analysis/{symbol}/multi")
def multi_timeframe_analysis(symbol: str):
    """
    Get technical analysis for all three timeframes: 1d, 1w, 1m.
    This endpoint delegates to the analysis-service microservice.
    """
    try:
        # Call the analysis microservice
        response = requests.get(
            f"{ANALYSIS_SERVICE_URL}/analysis/{symbol}/multi",
            timeout=15
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail=f"Analysis service is unavailable. Please ensure the analysis-service is running on {ANALYSIS_SERVICE_URL}"
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="Analysis service request timed out"
        )
    except requests.exceptions.HTTPError as e:
        try:
            error_detail = e.response.json().get("detail", str(e))
        except:
            error_detail = str(e)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Analysis service error: {error_detail}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calling analysis service: {str(e)}"
        )


# ---------------------------------------------------
# Historical data
# ---------------------------------------------------
@router.get("/crypto/{symbol}/history")
def history(symbol: str):
    df = get_symbol_df(symbol)
    return df.tail(100).to_dict(orient="records")


# ---------------------------------------------------
# LSTM Prediction (Microservice Integration)
# ---------------------------------------------------
@router.get("/lstm/predict/{symbol}")
def lstm_predict(symbol: str):
    """
    Get price prediction for a cryptocurrency using LSTM model.
    This endpoint delegates to the prediction-service microservice.
    """
    try:
        # Call the prediction microservice
        response = requests.get(
            f"{PREDICTION_SERVICE_URL}/predict/{symbol}",
            timeout=15
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail=f"Prediction service is unavailable. Please ensure the prediction-service is running on {PREDICTION_SERVICE_URL}"
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="Prediction service request timed out"
        )
    except requests.exceptions.HTTPError as e:
        # Forward the error from the microservice
        try:
            error_detail = e.response.json().get("detail", str(e))
        except:
            error_detail = str(e)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Prediction service error: {error_detail}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calling prediction service: {str(e)}"
        )


# ---------------------------------------------------
# On-Chain Metrics
# ---------------------------------------------------
@router.get("/onchain/{symbol}/metrics")
def get_onchain_metrics(symbol: str):
    """
    Get on-chain metrics for a cryptocurrency:
    - Number of active addresses
    - Number of transactions
    
    Note: For now, this returns mock data. In production, you would integrate
    with blockchain APIs like Blockchain.com, Blockchair, or CoinGecko.
    """
    import random
    import time
    
    # Extract base currency (e.g., BTC from BTCUSDT)
    base = symbol.replace('USDT', '').replace('USDC', '').upper()
    
    # For Bitcoin, we could use real APIs, but for now using mock data
    # In production, integrate with:
    # - Blockchain.com API: https://www.blockchain.com/api
    # - Blockchair API: https://blockchair.com/api
    # - CoinGecko API: https://www.coingecko.com/api
    
    # Generate realistic mock data based on symbol
    # Bitcoin typically has higher numbers
    if base == 'BTC':
        base_active_addresses = 800000
        base_transactions = 300000
    elif base in ['ETH', 'BNB', 'SOL']:
        base_active_addresses = 400000
        base_transactions = 200000
    else:
        base_active_addresses = 50000
        base_transactions = 25000
    
    # Add some variation to make it more realistic
    active_addresses = base_active_addresses + random.randint(-50000, 50000)
    transactions = base_transactions + random.randint(-20000, 20000)
    
    # Calculate 24h change (percentage)
    active_addresses_change = round(random.uniform(-5, 8), 2)
    transactions_change = round(random.uniform(-3, 10), 2)
    
    # Exchange flows (inflow/outflow in BTC or equivalent)
    if base == 'BTC':
        base_exchange_flow = 5000  # BTC
        exchange_inflow = base_exchange_flow + random.randint(-1000, 2000)
        exchange_outflow = base_exchange_flow + random.randint(-1500, 1500)
        exchange_net_flow = exchange_inflow - exchange_outflow
    elif base in ['ETH', 'BNB', 'SOL']:
        base_exchange_flow = 25000  # Equivalent units
        exchange_inflow = base_exchange_flow + random.randint(-5000, 10000)
        exchange_outflow = base_exchange_flow + random.randint(-7500, 7500)
        exchange_net_flow = exchange_inflow - exchange_outflow
    else:
        base_exchange_flow = 1000
        exchange_inflow = base_exchange_flow + random.randint(-200, 500)
        exchange_outflow = base_exchange_flow + random.randint(-300, 300)
        exchange_net_flow = exchange_inflow - exchange_outflow
    
    exchange_flow_change = round(random.uniform(-10, 15), 2)
    
    # Whale movements (large transactions)
    if base == 'BTC':
        whale_transactions = random.randint(50, 200)
        whale_volume = random.uniform(5000, 50000)  # BTC
    elif base in ['ETH', 'BNB', 'SOL']:
        whale_transactions = random.randint(100, 400)
        whale_volume = random.uniform(10000, 100000)
    else:
        whale_transactions = random.randint(10, 50)
        whale_volume = random.uniform(500, 5000)
    
    whale_change = round(random.uniform(-20, 25), 2)
    
    # Hash rate (network security - in TH/s for BTC, GH/s for others)
    if base == 'BTC':
        hash_rate = random.uniform(400, 600)  # Exahash per second (EH/s)
        hash_rate_unit = "EH/s"
    elif base == 'ETH':
        hash_rate = random.uniform(800, 1200)  # Terahash per second (TH/s)
        hash_rate_unit = "TH/s"
    elif base in ['BNB', 'SOL']:
        hash_rate = random.uniform(100, 500)  # GH/s
        hash_rate_unit = "GH/s"
    else:
        hash_rate = random.uniform(10, 100)  # GH/s
        hash_rate_unit = "GH/s"
    
    hash_rate_change = round(random.uniform(-3, 5), 2)
    
    # Total Value Locked (TVL) - Value locked in DeFi protocols
    if base == 'BTC':
        tvl = random.uniform(5, 15)  # Billions USD
    elif base == 'ETH':
        tvl = random.uniform(20, 50)  # Billions USD
    elif base in ['BNB', 'SOL']:
        tvl = random.uniform(1, 10)  # Billions USD
    else:
        tvl = random.uniform(0.1, 2)  # Billions USD
    
    tvl_change = round(random.uniform(-5, 8), 2)
    
    # NVT Ratio (Network Value to Transaction) - Market cap / Transaction volume
    # Lower NVT = undervalued, Higher NVT = overvalued
    if base == 'BTC':
        nvt_ratio = random.uniform(15, 35)
    elif base in ['ETH', 'BNB', 'SOL']:
        nvt_ratio = random.uniform(20, 50)
    else:
        nvt_ratio = random.uniform(30, 80)
    
    nvt_change = round(random.uniform(-10, 15), 2)
    
    # MVRV (Market Value to Realized Value) - Profitability of holders
    # MVRV > 3.7 = overvalued, MVRV < 1 = undervalued
    if base == 'BTC':
        mvrv = random.uniform(1.5, 3.5)
    elif base in ['ETH', 'BNB', 'SOL']:
        mvrv = random.uniform(1.2, 3.0)
    else:
        mvrv = random.uniform(0.8, 2.5)
    
    mvrv_change = round(random.uniform(-5, 10), 2)
    
    # Get historical data for trend (last 7 days)
    historical_data = []
    for i in range(7, 0, -1):
        historical_data.append({
            "date": (time.time() - (i * 86400)),  # Days ago
            "active_addresses": base_active_addresses + random.randint(-30000, 30000),
            "transactions": base_transactions + random.randint(-15000, 15000),
            "exchange_inflow": exchange_inflow + random.randint(-500, 500),
            "exchange_outflow": exchange_outflow + random.randint(-500, 500),
            "whale_transactions": whale_transactions + random.randint(-10, 10),
            "hash_rate": hash_rate + random.uniform(-10, 10)
        })
    
    return {
        "symbol": symbol,
        "base": base,
        "metrics": {
            "active_addresses": {
                "value": active_addresses,
                "change_24h": active_addresses_change,
                "description": "Number of unique addresses that were active in the network"
            },
            "transactions": {
                "value": transactions,
                "change_24h": transactions_change,
                "description": "Total number of transactions processed in the network"
            },
            "exchange_flows": {
                "inflow": exchange_inflow,
                "outflow": exchange_outflow,
                "net_flow": exchange_net_flow,
                "change_24h": exchange_flow_change,
                "description": "Inflow and outflow of cryptocurrencies from exchanges (indicator of buy/sell intentions). Positive net flow = more selling, Negative = more buying"
            },
            "whale_movements": {
                "transactions": whale_transactions,
                "volume": whale_volume,
                "change_24h": whale_change,
                "description": "Large transactions from whales (large influential investors). High volume may indicate significant market moves"
            },
            "hash_rate": {
                "value": hash_rate,
                "unit": hash_rate_unit,
                "change_24h": hash_rate_change,
                "description": "Network security measure. Higher hash rate indicates stronger network security and miner confidence"
            },
            "tvl": {
                "value": tvl,
                "change_24h": tvl_change,
                "description": "Total Value Locked in DeFi protocols. Higher TVL indicates more capital deployed in decentralized finance"
            },
            "nvt_ratio": {
                "value": nvt_ratio,
                "change_24h": nvt_change,
                "description": "Network Value to Transaction ratio (Market Cap / Transaction Volume). Lower values suggest undervaluation, higher values suggest overvaluation"
            },
            "mvrv": {
                "value": mvrv,
                "change_24h": mvrv_change,
                "description": "Market Value to Realized Value ratio. MVRV > 3.7 indicates overvaluation, MVRV < 1 indicates undervaluation. Measures profitability of holders"
            }
        },
        "historical": historical_data,
        "last_updated": time.time()
    }


@router.get("/onchain/{symbol}/active-addresses")
def get_active_addresses(symbol: str):
    """Get active addresses metric for a symbol"""
    metrics = get_onchain_metrics(symbol)
    return {
        "symbol": symbol,
        "active_addresses": metrics["metrics"]["active_addresses"]["value"],
        "change_24h": metrics["metrics"]["active_addresses"]["change_24h"],
        "description": metrics["metrics"]["active_addresses"]["description"]
    }


@router.get("/onchain/{symbol}/transactions")
def get_transactions(symbol: str):
    """Get transactions metric for a symbol"""
    metrics = get_onchain_metrics(symbol)
    return {
        "symbol": symbol,
        "transactions": metrics["metrics"]["transactions"]["value"],
        "change_24h": metrics["metrics"]["transactions"]["change_24h"],
        "description": metrics["metrics"]["transactions"]["description"]
    }


# ---------------------------------------------------
# Microservice Configuration
# ---------------------------------------------------

# Service URLs - can be overridden via environment variables
ANALYSIS_SERVICE_URL = os.getenv("ANALYSIS_SERVICE_URL", "http://127.0.0.1:8007")
PREDICTION_SERVICE_URL = os.getenv("PREDICTION_SERVICE_URL", "http://127.0.0.1:8006")
SENTIMENT_SERVICE_URL = os.getenv("SENTIMENT_SERVICE_URL", "http://127.0.0.1:8008")

@router.get("/sentiment/{symbol}")
def get_sentiment_analysis(symbol: str):
    """
    Get sentiment analysis for a cryptocurrency from social media and news sources.
    
    This endpoint delegates to the sentiment-service microservice.
    The microservice uses NLP techniques (VADER or TextBlob) to analyze sentiment from:
    - Twitter/X
    - Reddit
    - News articles
    
    Returns overall sentiment score and breakdown by source.
    """
    try:
        # Call the sentiment microservice
        response = requests.get(
            f"{SENTIMENT_SERVICE_URL}/sentiment/{symbol}",
            timeout=10  # 10 second timeout
        )
        response.raise_for_status()  # Raise exception for bad status codes
        return response.json()
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail=f"Sentiment service is unavailable. Please ensure the sentiment-service is running on {SENTIMENT_SERVICE_URL}"
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="Sentiment service request timed out"
        )
    except requests.exceptions.HTTPError as e:
        # Forward the error from the microservice
        try:
            error_detail = e.response.json().get("detail", str(e))
        except:
            error_detail = str(e)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Sentiment service error: {error_detail}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calling sentiment service: {str(e)}"
        )
