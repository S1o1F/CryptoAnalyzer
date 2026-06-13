# Sentiment Service

Microservice for cryptocurrency sentiment analysis from social media and news sources.

## Overview

This service provides sentiment analysis functionality for cryptocurrencies using NLP techniques. It analyzes sentiment from:
- Twitter/X posts
- Reddit discussions
- News articles

The service uses VADER (Valence Aware Dictionary and sEntiment Reasoner) or TextBlob for sentiment analysis, with a keyword-based fallback if neither library is available.

It's part of a microservices architecture and runs independently on port 8008.

## Endpoints

### `GET /sentiment/{symbol}`
Get sentiment analysis for a cryptocurrency symbol.

**Parameters:**
- `symbol` (path parameter): Cryptocurrency symbol (e.g., 'BTCUSDT', 'ETHUSDT')

**Response:**
```json
{
  "symbol": "BTCUSDT",
  "base": "BTC",
  "overall_sentiment": "positive",
  "overall_score": 0.234,
  "sentiment_distribution": {
    "positive": {
      "count": 8,
      "percentage": 57.1
    },
    "negative": {
      "count": 3,
      "percentage": 21.4
    },
    "neutral": {
      "count": 3,
      "percentage": 21.4
    }
  },
  "sources": {
    "twitter": {
      "sentiment": "positive",
      "average_score": 0.156,
      "posts": [...]
    },
    "reddit": {
      "sentiment": "positive",
      "average_score": 0.234,
      "posts": [...]
    },
    "news": {
      "sentiment": "positive",
      "average_score": 0.312,
      "articles": [...]
    }
  },
  "price_prediction_signal": "bullish",
  "recommendation": "BUY",
  "last_updated": 1704067200.0,
  "analysis_method": "VADER"
}
```

**Sentiment Values:**
- `positive`: Overall sentiment score > 0.1
- `negative`: Overall sentiment score < -0.1
- `neutral`: Overall sentiment score between -0.1 and 0.1

**Recommendations:**
- `BUY`: Overall sentiment is positive and score > 0.2
- `SELL`: Overall sentiment is negative and score < -0.2
- `HOLD`: Otherwise

### `GET /health`
Health check endpoint to verify service status and dependencies.

**Response:**
```json
{
  "status": "healthy",
  "service": "sentiment-service",
  "vader_available": true,
  "textblob_available": false,
  "analysis_method": "VADER"
}
```

## Running the Service

### Installation

1. Navigate to the sentiment-service directory:
```bash
cd sentiment-service
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

**Note**: The service will work with either VADER or TextBlob. VADER is preferred for social media sentiment analysis as it's specifically designed for that purpose.

### Running

```bash
python main.py
```

The service will start on `http://127.0.0.1:8008`

### Using Environment Variables

You can override the base directory using environment variables:

```bash
export BASE_DIR=/path/to/dians_hw3
python main.py
```

## Example Requests

### Using curl:
```bash
# Get sentiment analysis for Bitcoin
curl http://127.0.0.1:8008/sentiment/BTCUSDT

# Health check
curl http://127.0.0.1:8008/health
```

### Using Python:
```python
import requests

response = requests.get("http://127.0.0.1:8008/sentiment/BTCUSDT")
sentiment = response.json()
print(f"Overall sentiment: {sentiment['overall_sentiment']}")
print(f"Recommendation: {sentiment['recommendation']}")
```

## Dependencies

- **FastAPI**: Web framework for building APIs
- **VADER Sentiment**: Lexicon and rule-based sentiment analysis tool (preferred)
- **TextBlob**: Simple Python library for processing textual data (fallback)
- **uvicorn**: ASGI server for running FastAPI

## Architecture

This service:
- Analyzes sentiment from multiple sources (Twitter, Reddit, News)
- Uses NLP techniques (VADER or TextBlob) for sentiment scoring
- Provides overall sentiment score and breakdown by source
- Generates trading recommendations based on sentiment

**Note**: Currently uses mock data for demonstration. In production, this would integrate with:
- Twitter/X API
- Reddit API
- News aggregation APIs (e.g., NewsAPI, CryptoCompare)

## Error Handling

The service handles various error cases:
- **404**: Symbol not found (if validation is added)
- **500**: Sentiment analysis errors

## Integration

This service is designed to be called by:
- API Gateway (for routing requests)
- Main application (`api.py`)
- Frontend applications
- Other microservices

Make sure CORS is properly configured if calling from a web browser.

## Analysis Methods

1. **VADER** (Preferred): Specifically designed for social media sentiment analysis
   - Handles slang, emoticons, and capitalization
   - Returns compound score between -1 and 1

2. **TextBlob** (Fallback): General-purpose sentiment analysis
   - Uses pattern library
   - Returns polarity score between -1 and 1

3. **Keyword-based** (Last resort): Simple keyword matching
   - Matches positive/negative keywords
   - Returns fixed scores (0.3, -0.3, or 0.0)



