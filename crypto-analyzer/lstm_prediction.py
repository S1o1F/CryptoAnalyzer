import os
import random
import sqlite3
import numpy as np
import pandas as pd
import joblib
import json

from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error, r2_score

import tensorflow as tf
from keras.models import Sequential
from keras.layers import LSTM, Dense, Input, Dropout
from keras.callbacks import EarlyStopping
from keras.optimizers import Adam

DB_PATH = "database/data.db"
MODELS_DIR = "models"
METRICS_DIR = "models/metrics"

LOOKBACK_OPTIONS = [20, 30, 60]
TEST_RATIO = 0.30
EPOCHS = 50
BATCH_SIZE = 32
MIN_ROWS = 120
MAX_SYMBOLS = None

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(METRICS_DIR, exist_ok=True)

def set_seeds(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)

set_seeds()

def load_data_from_db():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql(
        """
        SELECT symbol, date, open, high, low, close, volume
        FROM crypto_data
        ORDER BY symbol, date
        """,
        conn
    )
    conn.close()
    return df


def create_sequences(data, lookback):
    X, y = [], []
    for i in range(len(data) - lookback):
        X.append(data[i:i + lookback])
        y.append(data[i + lookback, 3])
    return np.array(X), np.array(y).reshape(-1, 1)


def build_lstm_model(input_shape):
    model = Sequential([
        Input(shape=input_shape),
        LSTM(64, return_sequences=True),
        Dropout(0.2),
        LSTM(64, return_sequences=True),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(1)
    ])

    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss="mse",
        metrics=['mae']
    )
    return model


def train_for_symbol(symbol: str, ohlcv_data: np.ndarray):
    print(f"\n{'=' * 50}")
    print(f"[TRAINING] {symbol}")
    print(f"{'=' * 50}")
    print(f"Data points: {len(ohlcv_data)}")

    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(ohlcv_data)

    close_scaler = MinMaxScaler()
    close_scaler.fit_transform(ohlcv_data[:, 3].reshape(-1, 1))

    best_r2 = -np.inf
    best_model = None
    best_lookback = None
    best_metrics = None

    for lookback in LOOKBACK_OPTIONS:
        if len(scaled_data) <= lookback + 10:
            print(f"  Skipping lookback={lookback} (not enough data)")
            continue

        print(f"\n  Testing lookback={lookback} days...")

        X, y = create_sequences(scaled_data, lookback)

        split_idx = int(len(X) * (1 - TEST_RATIO))
        X_train, X_val = X[:split_idx], X[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]

        print(f"  Train samples: {len(X_train)}, Validation samples: {len(X_val)}")

        model = build_lstm_model((lookback, 5))

        es = EarlyStopping(
            monitor="val_loss",
            patience=10,
            restore_best_weights=True,
            verbose=0
        )

        history = model.fit(
            X_train,
            y_train,
            validation_data=(X_val, y_val),
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            callbacks=[es],
            verbose=0
        )

        preds = model.predict(X_val, verbose=0)

        preds_inv = close_scaler.inverse_transform(preds)
        y_val_inv = close_scaler.inverse_transform(y_val)

        rmse = np.sqrt(mean_squared_error(y_val_inv, preds_inv))
        mape = mean_absolute_percentage_error(y_val_inv, preds_inv) * 100  # as percentage
        r2 = r2_score(y_val_inv, preds_inv)

        final_train_loss = history.history['loss'][-1]
        final_val_loss = history.history['val_loss'][-1]

        print(f"  Results:")
        print(f"    RMSE: {rmse:.4f}")
        print(f"    MAPE: {mape:.2f}%")
        print(f"    R²:   {r2:.4f}")
        print(f"    Train Loss: {final_train_loss:.6f}")
        print(f"    Val Loss:   {final_val_loss:.6f}")

        if r2 > best_r2:
            best_r2 = r2
            best_model = model
            best_lookback = lookback
            best_metrics = {
                'symbol': symbol,
                'lookback': lookback,
                'rmse': float(rmse),
                'mape': float(mape),
                'r2': float(r2),
                'train_loss': float(final_train_loss),
                'val_loss': float(final_val_loss),
                'train_samples': len(X_train),
                'val_samples': len(X_val),
                'epochs_trained': len(history.history['loss'])
            }

    if best_model is None:
        print(f"[SKIPPED] Not enough data for {symbol}")
        return

    model_path = os.path.join(MODELS_DIR, f"{symbol}_lstm.joblib")
    joblib.dump(best_model, model_path)

    metrics_path = os.path.join(METRICS_DIR, f"{symbol}_metrics.json")
    with open(metrics_path, 'w') as f:
        json.dump(best_metrics, f, indent=2)

    print(f"\n[SAVED] Model: {model_path}")
    print(f"[SAVED] Metrics: {metrics_path}")
    print(f"[BEST] Lookback={best_lookback}, R²={best_r2:.4f}")


def main():
    print("=" * 60)
    print("LSTM Price Prediction Training")
    print("=" * 60)
    print(f"\nConfiguration:")
    print(f"  - Lookback periods: {LOOKBACK_OPTIONS}")
    print(f"  - Train/Val split: {int((1 - TEST_RATIO) * 100)}% / {int(TEST_RATIO * 100)}%")
    print(f"  - Max epochs: {EPOCHS}")
    print(f"  - Batch size: {BATCH_SIZE}")
    print(f"  - Loss function: MSE")
    print(f"  - Features: OHLCV (Open, High, Low, Close, Volume)")

    print("\n[INFO] Loading data from SQLite database...")
    df = load_data_from_db()

    symbols = df["symbol"].unique()
    if MAX_SYMBOLS:
        symbols = symbols[:MAX_SYMBOLS]

    print(f"[INFO] Training LSTM for {len(symbols)} symbols\n")

    trained_count = 0
    skipped_count = 0

    for i, symbol in enumerate(symbols):
        print(f"\nProgress: {i + 1}/{len(symbols)}")

        symbol_df = df[df["symbol"] == symbol].sort_values('date')

        if len(symbol_df) < MIN_ROWS:
            print(f"[SKIP] {symbol} - Only {len(symbol_df)} rows (need {MIN_ROWS})")
            skipped_count += 1
            continue

        ohlcv = symbol_df[['open', 'high', 'low', 'close', 'volume']].values
        train_for_symbol(symbol, ohlcv)
        trained_count += 1

    print("\n" + "=" * 60)
    print("LSTM Training Complete!")
    print("=" * 60)
    print(f"  Trained: {trained_count} models")
    print(f"  Skipped: {skipped_count} symbols (insufficient data)")
    print(f"  Models saved to: {MODELS_DIR}/")
    print(f"  Metrics saved to: {METRICS_DIR}/")


if __name__ == "__main__":
    main()
