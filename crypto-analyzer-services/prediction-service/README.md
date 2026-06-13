# Prediction Service

Microservice for cryptocurrency price predictions using LSTM models.

## Overview

This service provides price prediction functionality for cryptocurrencies using pre-trained LSTM (Long Short-Term Memory) neural network models. It's part of a microservices architecture and runs independently on port 8006.

## Endpoints

### `GET /predict/{symbol}`
Get price prediction for a cryptocurrency symbol.

**Parameters:**
- `symbol` (path parameter): Cryptocurrency symbol (e.g., 'BTCUSDT', 'ETHUSDT')

**Response:**
```json
{
  "symbol": "BTCUSDT",
  "current_price": 45000.0,
  "predicted_price": 45500.0,
  "price_change": 500.0,
  "price_change_pct": 1.11,
  "signal": "BUY",
  "lookback_days": 30,
  "features_used": "OHLCV",
  "model_metrics": {
    "rmse": 250.5,
    "mape": 0.55,
    "r2": 0.95,
    "train_samples": 1000,
    "val_samples": 300
  }
}
```

**Signals:**
- `STRONG BUY`: Price change > 2%
- `BUY`: Price change > 0.5%
- `HOLD`: Price change between -0.5% and 0.5%
- `SELL`: Price change < -0.5%
- `STRONG SELL`: Price change < -2%

### `GET /health`
Health check endpoint to verify service status and dependencies.

**Response:**
```json
{
  "status": "healthy",
  "service": "prediction-service",
  "database_exists": true,
  "models_dir_exists": true,
  "database_path": "/path/to/database/data.db",
  "models_dir_path": "/path/to/models"
}
```

## Running the Service

### Prerequisites
- Python 3.8+
- Trained LSTM models in the `../models/` directory
- Database at `../database/data.db`

### Installation

1. Navigate to the prediction-service directory:
```bash
cd prediction-service
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running

```bash
python main.py
```

The service will start on `http://127.0.0.1:8006`

### Using Environment Variables

You can override the base directory using environment variables:

```bash
export BASE_DIR=/path/to/dians_hw3
python main.py
```

## Example Requests

### Using curl:
```bash
# Get prediction for Bitcoin
curl http://127.0.0.1:8006/predict/BTCUSDT

# Health check
curl http://127.0.0.1:8006/health
```

### Using Python:
```python
import requests

response = requests.get("http://127.0.0.1:8006/predict/BTCUSDT")
prediction = response.json()
print(f"Predicted price: {prediction['predicted_price']}")
print(f"Signal: {prediction['signal']}")
```

## Dependencies

- **FastAPI**: Web framework for building APIs
- **TensorFlow/Keras**: For loading and running LSTM models
- **scikit-learn**: For data preprocessing (MinMaxScaler)
- **pandas, numpy**: For data manipulation
- **joblib**: For model serialization/deserialization

## Architecture

This service:
- Reads historical data from the shared database (`../database/data.db`)
- Loads pre-trained LSTM models from `../models/`
- Performs predictions using the loaded models
- Returns predictions with trading signals and model metrics

## Error Handling

The service handles various error cases:
- **404**: Model not found for symbol
- **400**: Insufficient data for prediction
- **500**: Database or model loading errors

## Integration

This service is designed to be called by:
- API Gateway (for routing requests)
- Frontend applications
- Other microservices

Make sure CORS is properly configured if calling from a web browser.

