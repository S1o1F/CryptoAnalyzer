from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import sqlite3
import pandas as pd
from pathlib import Path
from abc import ABC, abstractmethod
from typing import Union

from ta.momentum import RSIIndicator, StochasticOscillator
from ta.trend import MACD, ADXIndicator, CCIIndicator, SMAIndicator, EMAIndicator, WMAIndicator
from ta.volatility import BollingerBands

# Configuration - can be overridden via environment variables
BASE_DIR = Path(os.getenv("BASE_DIR", Path(__file__).parent.parent))
DB_PATH = BASE_DIR / "database" / "data.db"

app = FastAPI(
    title="Analysis Service",
    version="1.0.0",
    description="Microservice for cryptocurrency technical analysis with 10 indicators"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# DATABASE UTILITIES
# ============================================================================

def get_symbol_df(symbol: str) -> pd.DataFrame:
    """Get historical data for a symbol from the database"""
    if not DB_PATH.exists():
        raise HTTPException(
            status_code=500, 
            detail=f"Database not found at {DB_PATH}"
        )

    try:
        conn = sqlite3.connect(str(DB_PATH))
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
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

    if df.empty:
        raise HTTPException(
            status_code=404, 
            detail=f"Symbol '{symbol}' not found in database"
        )

    return df


def resample_data(df: pd.DataFrame, timeframe: str) -> pd.DataFrame:
    """Resample OHLCV data to different timeframes"""
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)
    
    numeric_cols = ['open', 'high', 'low', 'close', 'volume']
    df_numeric = df[numeric_cols]
    
    if timeframe == "1w":
        resampled = df_numeric.resample('W').agg({
            'open': 'first',
            'high': 'max',
            'low': 'min',
            'close': 'last',
            'volume': 'sum'
        }).dropna()
    elif timeframe == "1m":
        try:
            resampled = df_numeric.resample('ME').agg({
                'open': 'first',
                'high': 'max',
                'low': 'min',
                'close': 'last',
                'volume': 'sum'
            }).dropna()
        except:
            resampled = df_numeric.resample('M').agg({
                'open': 'first',
                'high': 'max',
                'low': 'min',
                'close': 'last',
                'volume': 'sum'
            }).dropna()
    else:
        resampled = df_numeric
    
    resampled.reset_index(inplace=True)
    return resampled


# ============================================================================
# STRATEGY PATTERN IMPLEMENTATION
# ============================================================================

class SignalStrategy(ABC):
    """Abstract base class for all signal calculation strategies."""
    
    @abstractmethod
    def calculate_signal(self, *args) -> str:
        """Calculate trading signal based on the strategy's algorithm."""
        pass
    
    def _check_nan(self, *values) -> bool:
        """Helper method to check if any value is NaN."""
        return any(pd.isna(val) for val in values)


class RSISignalStrategy(SignalStrategy):
    def calculate_signal(self, rsi: Union[float, pd.Series]) -> str:
        if self._check_nan(rsi):
            return "HOLD"
        if rsi < 30:
            return "BUY"
        elif rsi > 70:
            return "SELL"
        return "HOLD"


class MACDSignalStrategy(SignalStrategy):
    def calculate_signal(self, macd_diff: Union[float, pd.Series]) -> str:
        if self._check_nan(macd_diff):
            return "HOLD"
        if macd_diff > 0:
            return "BUY"
        elif macd_diff < 0:
            return "SELL"
        return "HOLD"


class StochasticSignalStrategy(SignalStrategy):
    def calculate_signal(self, stoch: Union[float, pd.Series]) -> str:
        if self._check_nan(stoch):
            return "HOLD"
        if stoch < 20:
            return "BUY"
        elif stoch > 80:
            return "SELL"
        return "HOLD"


class ADXSignalStrategy(SignalStrategy):
    def calculate_signal(self, adx: Union[float, pd.Series], 
                        plus_di: Union[float, pd.Series], 
                        minus_di: Union[float, pd.Series]) -> str:
        if self._check_nan(adx, plus_di, minus_di):
            return "HOLD"
        if adx > 25:
            if plus_di > minus_di:
                return "BUY"
            elif minus_di > plus_di:
                return "SELL"
        return "HOLD"


class CCISignalStrategy(SignalStrategy):
    def calculate_signal(self, cci: Union[float, pd.Series]) -> str:
        if self._check_nan(cci):
            return "HOLD"
        if cci < -100:
            return "BUY"
        elif cci > 100:
            return "SELL"
        return "HOLD"


class MASignalStrategy(SignalStrategy):
    def calculate_signal(self, price: Union[float, pd.Series], 
                       ma: Union[float, pd.Series]) -> str:
        if self._check_nan(ma, price):
            return "HOLD"
        if price > ma:
            return "BUY"
        elif price < ma:
            return "SELL"
        return "HOLD"


class BollingerBandsSignalStrategy(SignalStrategy):
    def calculate_signal(self, price: Union[float, pd.Series], 
                        lower: Union[float, pd.Series], 
                        upper: Union[float, pd.Series]) -> str:
        if self._check_nan(lower, upper, price):
            return "HOLD"
        if price < lower:
            return "BUY"
        elif price > upper:
            return "SELL"
        return "HOLD"


class VolumeSignalStrategy(SignalStrategy):
    def calculate_signal(self, current_vol: Union[float, pd.Series], 
                        vol_ma: Union[float, pd.Series]) -> str:
        if self._check_nan(current_vol, vol_ma):
            return "HOLD"
        if current_vol > vol_ma * 1.5:
            return "BUY"
        return "HOLD"


# Strategy instances
RSI_STRATEGY = RSISignalStrategy()
MACD_STRATEGY = MACDSignalStrategy()
STOCHASTIC_STRATEGY = StochasticSignalStrategy()
ADX_STRATEGY = ADXSignalStrategy()
CCI_STRATEGY = CCISignalStrategy()
MA_STRATEGY = MASignalStrategy()
BOLLINGER_STRATEGY = BollingerBandsSignalStrategy()
VOLUME_STRATEGY = VolumeSignalStrategy()


# Signal functions
def rsi_signal(rsi):
    return RSI_STRATEGY.calculate_signal(rsi)


def macd_signal(macd_diff):
    return MACD_STRATEGY.calculate_signal(macd_diff)


def stochastic_signal(stoch):
    return STOCHASTIC_STRATEGY.calculate_signal(stoch)


def adx_signal(adx, plus_di, minus_di):
    return ADX_STRATEGY.calculate_signal(adx, plus_di, minus_di)


def cci_signal(cci):
    return CCI_STRATEGY.calculate_signal(cci)


def ma_signal(price, ma):
    return MA_STRATEGY.calculate_signal(price, ma)


def bollinger_signal(price, lower, upper):
    return BOLLINGER_STRATEGY.calculate_signal(price, lower, upper)


def volume_signal(current_vol, vol_ma):
    return VOLUME_STRATEGY.calculate_signal(current_vol, vol_ma)


# ============================================================================
# SIMPLE FACTORY PATTERN IMPLEMENTATION
# ============================================================================

class IndicatorFactory:
    """Simple Factory for creating technical indicators."""
    
    @staticmethod
    def create_rsi(close: pd.Series, window: int):
        try:
            rsi_indicator = RSIIndicator(close, window=window)
            return rsi_indicator.rsi().iloc[-1]
        except Exception as e:
            print(f"RSI calculation error: {e}")
            return None
    
    @staticmethod
    def create_macd(close: pd.Series):
        try:
            macd_indicator = MACD(close)
            return {
                'macd_line': macd_indicator.macd().iloc[-1],
                'signal_line': macd_indicator.macd_signal().iloc[-1],
                'diff': macd_indicator.macd_diff().iloc[-1]
            }
        except Exception as e:
            print(f"MACD calculation error: {e}")
            return None
    
    @staticmethod
    def create_stochastic(high: pd.Series, low: pd.Series, close: pd.Series, window: int):
        try:
            stoch_indicator = StochasticOscillator(high, low, close, window=window)
            return {
                'k': stoch_indicator.stoch().iloc[-1],
                'd': stoch_indicator.stoch_signal().iloc[-1]
            }
        except Exception as e:
            print(f"Stochastic calculation error: {e}")
            return None
    
    @staticmethod
    def create_adx(high: pd.Series, low: pd.Series, close: pd.Series, window: int):
        try:
            adx_indicator = ADXIndicator(high, low, close, window=window)
            return {
                'adx': adx_indicator.adx().iloc[-1],
                'plus_di': adx_indicator.adx_pos().iloc[-1],
                'minus_di': adx_indicator.adx_neg().iloc[-1]
            }
        except Exception as e:
            print(f"ADX calculation error: {e}")
            return None
    
    @staticmethod
    def create_cci(high: pd.Series, low: pd.Series, close: pd.Series, window: int):
        try:
            cci_indicator = CCIIndicator(high, low, close, window=window)
            return cci_indicator.cci().iloc[-1]
        except Exception as e:
            print(f"CCI calculation error: {e}")
            return None
    
    @staticmethod
    def create_sma(close: pd.Series, window: int):
        try:
            sma_indicator = SMAIndicator(close, window=window)
            return sma_indicator.sma_indicator().iloc[-1]
        except Exception as e:
            print(f"SMA calculation error: {e}")
            return None
    
    @staticmethod
    def create_ema(close: pd.Series, window: int):
        try:
            ema_indicator = EMAIndicator(close, window=window)
            return ema_indicator.ema_indicator().iloc[-1]
        except Exception as e:
            print(f"EMA calculation error: {e}")
            return None
    
    @staticmethod
    def create_wma(close: pd.Series, window: int):
        try:
            wma_indicator = WMAIndicator(close, window=window)
            return wma_indicator.wma().iloc[-1]
        except Exception as e:
            print(f"WMA calculation error: {e}")
            return None
    
    @staticmethod
    def create_bollinger_bands(close: pd.Series, window: int):
        try:
            bb_indicator = BollingerBands(close, window=window)
            return {
                'high': bb_indicator.bollinger_hband().iloc[-1],
                'mid': bb_indicator.bollinger_mavg().iloc[-1],
                'low': bb_indicator.bollinger_lband().iloc[-1],
                'width': bb_indicator.bollinger_wband().iloc[-1]
            }
        except Exception as e:
            print(f"Bollinger Bands calculation error: {e}")
            return None
    
    @staticmethod
    def create_volume_ma(volume: pd.Series, window: int):
        try:
            vol_ma = volume.rolling(window).mean().iloc[-1]
            current_vol = volume.iloc[-1]
            return {
                'vol_ma': vol_ma,
                'current_vol': current_vol
            }
        except Exception as e:
            print(f"Volume MA calculation error: {e}")
            return None


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/analysis/{symbol}")
def technical_analysis(symbol: str, timeframe: str = "1d"):
    """
    Comprehensive technical analysis with 10 indicators:
    - 5 Oscillators: RSI, MACD, Stochastic, ADX, CCI
    - 5 Moving Averages: SMA, EMA, WMA, Bollinger Bands, Volume MA
    
    Timeframes: 1d (daily), 1w (weekly), 1m (monthly)
    """
    df = get_symbol_df(symbol)
    
    # Resample data based on timeframe
    if timeframe in ["1w", "1m"]:
        try:
            df = resample_data(df, timeframe)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing {timeframe} timeframe data: {str(e)}. This coin may not have enough historical data for monthly analysis."
            )
    
    # Minimum data requirements
    min_data = {
        "1d": 50,
        "1w": 20,
        "1m": 6
    }
    required = min_data.get(timeframe, 50)
    
    if len(df) < required:
        raise HTTPException(
            status_code=400, 
            detail=f"Not enough historical data for {timeframe} timeframe. Need at least {required} data points, but only have {len(df)}."
        )

    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df["volume"]
    
    # Adjust window sizes based on timeframe
    data_len = len(df)
    
    if timeframe == "1m":
        rsi_window = min(7, data_len - 1)
        stoch_window = min(7, data_len - 1)
        adx_window = min(7, data_len - 1)
        cci_window = min(10, data_len - 1)
        ma_window = min(10, data_len - 1)
        bb_window = min(10, data_len - 1)
    elif timeframe == "1w":
        rsi_window = min(10, data_len - 1)
        stoch_window = min(10, data_len - 1)
        adx_window = min(10, data_len - 1)
        cci_window = min(14, data_len - 1)
        ma_window = min(14, data_len - 1)
        bb_window = min(14, data_len - 1)
    else:
        rsi_window = 14
        stoch_window = 14
        adx_window = 14
        cci_window = 20
        ma_window = 20
        bb_window = 20
    
    # Ensure minimum window size
    rsi_window = max(2, rsi_window)
    stoch_window = max(2, stoch_window)
    adx_window = max(2, adx_window)
    cci_window = max(2, cci_window)
    ma_window = max(2, ma_window)
    bb_window = max(2, bb_window)

    # Calculate indicators using Factory pattern
    rsi_value = IndicatorFactory.create_rsi(close, rsi_window)
    
    macd_data = IndicatorFactory.create_macd(close)
    macd_line = macd_data['macd_line'] if macd_data else None
    macd_signal_line = macd_data['signal_line'] if macd_data else None
    macd_diff = macd_data['diff'] if macd_data else None
    
    stoch_data = IndicatorFactory.create_stochastic(high, low, close, stoch_window)
    stoch_k = stoch_data['k'] if stoch_data else None
    stoch_d = stoch_data['d'] if stoch_data else None
    
    adx_data = IndicatorFactory.create_adx(high, low, close, adx_window)
    adx_value = adx_data['adx'] if adx_data else None
    plus_di = adx_data['plus_di'] if adx_data else None
    minus_di = adx_data['minus_di'] if adx_data else None
    
    cci_value = IndicatorFactory.create_cci(high, low, close, cci_window)
    
    sma_value = IndicatorFactory.create_sma(close, ma_window)
    ema_value = IndicatorFactory.create_ema(close, ma_window)
    wma_value = IndicatorFactory.create_wma(close, ma_window)
    
    bb_data = IndicatorFactory.create_bollinger_bands(close, bb_window)
    bb_high = bb_data['high'] if bb_data else None
    bb_mid = bb_data['mid'] if bb_data else None
    bb_low = bb_data['low'] if bb_data else None
    bb_width = bb_data['width'] if bb_data else None
    
    vol_data = IndicatorFactory.create_volume_ma(volume, ma_window)
    vol_ma = vol_data['vol_ma'] if vol_data else None
    current_vol = vol_data['current_vol'] if vol_data else None

    price = close.iloc[-1]

    # Generate signals using Strategy pattern
    oscillator_signals = {
        "RSI": {
            "value": float(rsi_value) if rsi_value is not None and not pd.isna(rsi_value) else None,
            "signal": rsi_signal(rsi_value),
            "description": f"{'Oversold' if rsi_value and rsi_value < 30 else 'Overbought' if rsi_value and rsi_value > 70 else 'Neutral'}"
        },
        "MACD": {
            "value": float(macd_diff) if macd_diff is not None and not pd.isna(macd_diff) else None,
            "macd_line": float(macd_line) if macd_line is not None and not pd.isna(macd_line) else None,
            "signal_line": float(macd_signal_line) if macd_signal_line is not None and not pd.isna(macd_signal_line) else None,
            "signal": macd_signal(macd_diff),
            "description": f"{'Bullish' if macd_diff and macd_diff > 0 else 'Bearish'} momentum"
        },
        "Stochastic": {
            "value": float(stoch_k) if stoch_k is not None and not pd.isna(stoch_k) else None,
            "k_line": float(stoch_k) if stoch_k is not None and not pd.isna(stoch_k) else None,
            "d_line": float(stoch_d) if stoch_d is not None and not pd.isna(stoch_d) else None,
            "signal": stochastic_signal(stoch_k),
            "description": f"{'Oversold' if stoch_k and stoch_k < 20 else 'Overbought' if stoch_k and stoch_k > 80 else 'Neutral'}"
        },
        "ADX": {
            "value": float(adx_value) if adx_value is not None and not pd.isna(adx_value) else None,
            "plus_di": float(plus_di) if plus_di is not None and not pd.isna(plus_di) else None,
            "minus_di": float(minus_di) if minus_di is not None and not pd.isna(minus_di) else None,
            "signal": adx_signal(adx_value, plus_di, minus_di),
            "description": f"{'Strong' if adx_value and adx_value > 25 else 'Weak'} trend"
        },
        "CCI": {
            "value": float(cci_value) if cci_value is not None and not pd.isna(cci_value) else None,
            "signal": cci_signal(cci_value),
            "description": f"{'Oversold' if cci_value and cci_value < -100 else 'Overbought' if cci_value and cci_value > 100 else 'Neutral'}"
        }
    }
    
    ma_signals = {
        "SMA": {
            "value": float(sma_value) if sma_value is not None and not pd.isna(sma_value) else None,
            "signal": ma_signal(price, sma_value),
            "description": f"Price {'above' if sma_value and price > sma_value else 'below'} SMA({ma_window})"
        },
        "EMA": {
            "value": float(ema_value) if ema_value is not None and not pd.isna(ema_value) else None,
            "signal": ma_signal(price, ema_value),
            "description": f"Price {'above' if ema_value and price > ema_value else 'below'} EMA({ma_window})"
        },
        "WMA": {
            "value": float(wma_value) if wma_value is not None and not pd.isna(wma_value) else None,
            "signal": ma_signal(price, wma_value),
            "description": f"Price {'above' if wma_value and price > wma_value else 'below'} WMA({ma_window})"
        },
        "Bollinger_Bands": {
            "upper": float(bb_high) if bb_high is not None and not pd.isna(bb_high) else None,
            "middle": float(bb_mid) if bb_mid is not None and not pd.isna(bb_mid) else None,
            "lower": float(bb_low) if bb_low is not None and not pd.isna(bb_low) else None,
            "width": float(bb_width) if bb_width is not None and not pd.isna(bb_width) else None,
            "signal": bollinger_signal(price, bb_low, bb_high),
            "description": f"Price {'near lower band' if bb_low and price < bb_low else 'near upper band' if bb_high and price > bb_high else 'within bands'}"
        },
        "Volume_MA": {
            "value": float(vol_ma) if vol_ma is not None and not pd.isna(vol_ma) else None,
            "current_volume": float(current_vol) if current_vol is not None and not pd.isna(current_vol) else None,
            "signal": volume_signal(current_vol, vol_ma),
            "description": f"Volume {'above' if vol_ma and current_vol and current_vol > vol_ma else 'below'} average"
        }
    }

    # Calculate overall signal
    all_signals = []
    for key, data in oscillator_signals.items():
        all_signals.append(data["signal"])
    for key, data in ma_signals.items():
        all_signals.append(data["signal"])
    
    buy_count = all_signals.count("BUY")
    sell_count = all_signals.count("SELL")
    hold_count = all_signals.count("HOLD")
    
    if buy_count > sell_count and buy_count > hold_count:
        overall_signal = "BUY"
    elif sell_count > buy_count and sell_count > hold_count:
        overall_signal = "SELL"
    else:
        overall_signal = "HOLD"
    
    total_signals = len(all_signals)
    buy_strength = round((buy_count / total_signals) * 100, 1) if total_signals > 0 else 0
    sell_strength = round((sell_count / total_signals) * 100, 1) if total_signals > 0 else 0

    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "current_price": float(price),
        "oscillators": oscillator_signals,
        "moving_averages": ma_signals,
        "summary": {
            "overall_signal": overall_signal,
            "buy_count": buy_count,
            "sell_count": sell_count,
            "hold_count": hold_count,
            "buy_strength": buy_strength,
            "sell_strength": sell_strength,
            "total_indicators": total_signals
        },
        "indicators": {
            "RSI": float(rsi_value) if rsi_value is not None and not pd.isna(rsi_value) else 0,
            "MACD": float(macd_diff) if macd_diff is not None and not pd.isna(macd_diff) else 0,
            "Stochastic": float(stoch_k) if stoch_k is not None and not pd.isna(stoch_k) else 0,
            "ADX": float(adx_value) if adx_value is not None and not pd.isna(adx_value) else 0,
            "CCI": float(cci_value) if cci_value is not None and not pd.isna(cci_value) else 0,
            "SMA": float(sma_value) if sma_value is not None and not pd.isna(sma_value) else 0,
            "EMA": float(ema_value) if ema_value is not None and not pd.isna(ema_value) else 0,
            "WMA": float(wma_value) if wma_value is not None and not pd.isna(wma_value) else 0,
            "Bollinger_High": float(bb_high) if bb_high is not None and not pd.isna(bb_high) else 0,
            "Bollinger_Low": float(bb_low) if bb_low is not None and not pd.isna(bb_low) else 0,
            "Volume_MA": float(vol_ma) if vol_ma is not None and not pd.isna(vol_ma) else 0,
        },
        "signals": {
            "individual": all_signals,
            "final": overall_signal
        }
    }


@app.get("/analysis/{symbol}/multi")
def multi_timeframe_analysis(symbol: str):
    """Get technical analysis for all three timeframes: 1d, 1w, 1m"""
    results = {}
    
    for tf in ["1d", "1w", "1m"]:
        try:
            results[tf] = technical_analysis(symbol, tf)
        except HTTPException as e:
            results[tf] = {"error": e.detail}
    
    # Aggregate signals across timeframes
    signals = []
    for tf, data in results.items():
        if "summary" in data:
            signals.append(data["summary"]["overall_signal"])
    
    buy_count = signals.count("BUY")
    sell_count = signals.count("SELL")
    
    if buy_count > sell_count:
        aggregate_signal = "BUY"
    elif sell_count > buy_count:
        aggregate_signal = "SELL"
    else:
        aggregate_signal = "HOLD"
    
    return {
        "symbol": symbol,
        "timeframes": results,
        "aggregate_signal": aggregate_signal
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "analysis-service",
        "database_exists": DB_PATH.exists(),
        "database_path": str(DB_PATH)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8007, reload=True)



