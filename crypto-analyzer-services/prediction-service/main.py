from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import sqlite3
import numpy as np
import pandas as pd
import joblib
import json
from pathlib import Path

from sklearn.preprocessing import MinMaxScaler

# Configuration - can be overridden via environment variables
BASE_DIR = Path(os.getenv("BASE_DIR", Path(__file__).parent.parent))
DB_PATH = BASE_DIR / "database" / "data.db"
MODELS_DIR = BASE_DIR / "models"

app = FastAPI(
    title="Prediction Service",
    version="1.0.0",
    description="Microservice for cryptocurrency price predictions using LSTM models"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/predict/{symbol}")
def predict(symbol: str):
    """
    Predict future price for a cryptocurrency symbol using LSTM model.
    
    Args:
        symbol: Cryptocurrency symbol (e.g., 'BTCUSDT', 'ETHUSDT')
    
    Returns:
        Dictionary containing:
        - symbol: The cryptocurrency symbol
        - current_price: Current price
        - predicted_price: Predicted future price
        - price_change: Absolute price change
        - price_change_pct: Percentage price change
        - signal: Trading signal (STRONG BUY, BUY, HOLD, SELL, STRONG SELL)
        - lookback_days: Number of days used for prediction
        - features_used: Features used (OHLCV or Close)
        - model_metrics: Model performance metrics (if available)
    """
    model_path = MODELS_DIR / f"{symbol}_lstm.joblib"
    metrics_path = MODELS_DIR / "metrics" / f"{symbol}_metrics.json"

    if not model_path.exists():
        # List available models
        available_models = []
        if MODELS_DIR.exists():
            for model_file in MODELS_DIR.glob("*_lstm.joblib"):
                model_name = model_file.stem.replace("_lstm", "")
                available_models.append(model_name)
        
        error_detail = f"Model not trained for symbol '{symbol}'."
        if available_models:
            # Show first 10 available models
            sample_models = sorted(available_models)[:10]
            error_detail += f" Available models include: {', '.join(sample_models)}"
            if len(available_models) > 10:
                error_detail += f" (and {len(available_models) - 10} more)"
        
        raise HTTPException(
            status_code=404, 
            detail=error_detail
        )

    try:
        df = get_symbol_df(symbol)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching data: {str(e)}"
        )
    
    # Get OHLCV data
    ohlcv_cols = ['open', 'high', 'low', 'close', 'volume']
    if all(col in df.columns for col in ohlcv_cols):
        ohlcv_data = df[ohlcv_cols].values
        close_prices = df["close"].values.reshape(-1, 1)
        use_ohlcv = True
    else:
        close_prices = df["close"].values.reshape(-1, 1)
        use_ohlcv = False

    if len(close_prices) < 30:
        raise HTTPException(
            status_code=400, 
            detail=f"Not enough data for prediction. Need at least 30 data points, got {len(close_prices)}"
        )

    try:
        model = joblib.load(str(model_path))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load model: {str(e)}"
        )
    
    # Determine lookback from model input shape
    try:
        lookback = model.input_shape[1]
    except:
        lookback = 30
    
    try:
        if use_ohlcv and model.input_shape[-1] == 5:
            # Model trained with OHLCV features
            scaler = MinMaxScaler()
            scaled_ohlcv = scaler.fit_transform(ohlcv_data)
            
            close_scaler = MinMaxScaler()
            close_scaler.fit_transform(close_prices)
            
            last_seq = scaled_ohlcv[-lookback:].reshape(1, lookback, 5)
            prediction_scaled = model.predict(last_seq, verbose=0)
            prediction = close_scaler.inverse_transform(prediction_scaled)[0][0]
        else:
            # Model trained with close price only
            scaler = MinMaxScaler()
            scaled = scaler.fit_transform(close_prices)
            
            last_seq = scaled[-lookback:].reshape(1, lookback, 1)
            prediction_scaled = model.predict(last_seq, verbose=0)
            prediction = scaler.inverse_transform(prediction_scaled)[0][0]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )

    current_price = float(close_prices[-1][0])
    predicted_price = float(prediction)
    price_change = predicted_price - current_price
    price_change_pct = (price_change / current_price) * 100
    
    # Determine signal
    if price_change_pct > 2:
        signal = "STRONG BUY"
    elif price_change_pct > 0.5:
        signal = "BUY"
    elif price_change_pct < -2:
        signal = "STRONG SELL"
    elif price_change_pct < -0.5:
        signal = "SELL"
    else:
        signal = "HOLD"
    
    result = {
        "symbol": symbol,
        "current_price": current_price,
        "predicted_price": predicted_price,
        "price_change": float(price_change),
        "price_change_pct": float(price_change_pct),
        "signal": signal,
        "lookback_days": lookback,
        "features_used": "OHLCV" if (use_ohlcv and model.input_shape[-1] == 5) else "Close"
    }
    
    # Load metrics if available
    if metrics_path.exists():
        try:
            with open(metrics_path, 'r') as f:
                metrics = json.load(f)
                result["model_metrics"] = {
                    "rmse": metrics.get("rmse"),
                    "mape": metrics.get("mape"),
                    "r2": metrics.get("r2"),
                    "train_samples": metrics.get("train_samples"),
                    "val_samples": metrics.get("val_samples")
                }
        except Exception as e:
            # Don't fail if metrics can't be loaded
            pass
    
    return result


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "prediction-service",
        "database_exists": DB_PATH.exists(),
        "models_dir_exists": MODELS_DIR.exists(),
        "database_path": str(DB_PATH),
        "models_dir_path": str(MODELS_DIR)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8006, reload=True)

