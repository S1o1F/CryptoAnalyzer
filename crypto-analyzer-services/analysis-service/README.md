# Analysis Service

Microservice for cryptocurrency technical analysis with 10 indicators.

## Overview

This service provides comprehensive technical analysis functionality for cryptocurrencies using:
- 5 Oscillators: RSI, MACD, Stochastic, ADX, CCI
- 5 Moving Averages: SMA, EMA, WMA, Bollinger Bands, Volume MA

It's part of a microservices architecture and runs independently on port 8007.

## Endpoints

### `GET /analysis/{symbol}?timeframe=1d`
Get technical analysis for a cryptocurrency symbol.

**Parameters:**
- `symbol` (path parameter): Cryptocurrency symbol (e.g., 'BTCUSDT', 'ETHUSDT')
- `timeframe` (query parameter): Timeframe - '1d' (daily), '1w' (weekly), '1m' (monthly). Default: '1d'

**Response:**
Returns comprehensive technical analysis with all indicators, signals, and summary.

### `GET /analysis/{symbol}/multi`
Get technical analysis for all three timeframes (1d, 1w, 1m) with aggregate signal.

### `GET /health`
Health check endpoint.

## Running the Service

### Installation

1. Navigate to the analysis-service directory:
```bash
cd analysis-service
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running

```bash
python main.py
```

The service will start on `http://127.0.0.1:8007`

## Example Requests

```bash
# Get analysis for Bitcoin (daily)
curl http://127.0.0.1:8007/analysis/BTCUSDT

# Get analysis for Bitcoin (weekly)
curl http://127.0.0.1:8007/analysis/BTCUSDT?timeframe=1w

# Get multi-timeframe analysis
curl http://127.0.0.1:8007/analysis/BTCUSDT/multi

# Health check
curl http://127.0.0.1:8007/health
```

## Design Patterns Used

- **Strategy Pattern**: For signal calculation algorithms
- **Simple Factory Pattern**: For indicator creation

## Architecture

This service:
- Reads historical data from the shared database (`../database/data.db`)
- Performs technical analysis using 10 indicators
- Returns analysis results with trading signals and summaries

## Error Handling

The service handles various error cases:
- **404**: Symbol not found in database
- **400**: Insufficient data for analysis
- **500**: Database or calculation errors

## Integration

This service is designed to be called by:
- Main API (for routing requests)
- Frontend applications
- Other microservices

Make sure CORS is properly configured if calling from a web browser.



