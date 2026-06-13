from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import random
import time
from pathlib import Path

# Try to import sentiment analysis libraries
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    vader_available = True
    textblob_available = False
except ImportError:
    try:
        from textblob import TextBlob
        textblob_available = True
        vader_available = False
    except ImportError:
        textblob_available = False
        vader_available = False

# Configuration - can be overridden via environment variables
BASE_DIR = Path(os.getenv("BASE_DIR", Path(__file__).parent.parent))

app = FastAPI(
    title="Sentiment Service",
    version="1.0.0",
    description="Microservice for cryptocurrency sentiment analysis from social media and news sources"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# SENTIMENT ANALYSIS UTILITIES
# ============================================================================

def analyze_sentiment(text: str) -> tuple[str, float]:
    """
    Analyze sentiment of text using VADER, TextBlob, or keyword-based fallback.
    
    Returns:
        tuple: (sentiment_label, score) where sentiment_label is 'positive', 'negative', or 'neutral'
    """
    if vader_available:
        analyzer = SentimentIntensityAnalyzer()
        scores = analyzer.polarity_scores(text)
        compound = scores['compound']
        if compound >= 0.05:
            return 'positive', compound
        elif compound <= -0.05:
            return 'negative', compound
        else:
            return 'neutral', compound
    elif textblob_available:
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        if polarity > 0.1:
            return 'positive', polarity
        elif polarity < -0.1:
            return 'negative', polarity
        else:
            return 'neutral', polarity
    else:
        # Fallback: simple keyword-based sentiment
        positive_words = ['bullish', 'great', 'love', 'strong', 'positive', 'good', 
                         'excellent', 'amazing', 'partnership', 'growth', 'buy', 
                         'up', 'rise', 'gain', 'surge', 'rally']
        negative_words = ['bearish', 'concerned', 'weakness', 'warning', 'uncertain', 
                         'bad', 'poor', 'decline', 'risk', 'sell', 'down', 'fall', 
                         'drop', 'crash', 'dump']
        text_lower = text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        if pos_count > neg_count:
            return 'positive', 0.3
        elif neg_count > pos_count:
            return 'negative', -0.3
        else:
            return 'neutral', 0.0


def generate_mock_data(base: str) -> dict:
    """
    Generate mock social media posts and news articles for a cryptocurrency.
    In production, this would fetch real data from APIs.
    """
    mock_tweets = [
        f"{base} is looking bullish! Great fundamentals and strong community support.",
        f"Just bought more {base}. This is the future of finance!",
        f"{base} price action is concerning. Might be time to take profits.",
        f"Love the {base} ecosystem. The technology is revolutionary!",
        f"{base} showing weakness. Market sentiment turning negative.",
        f"Big news for {base}! Major partnership announcement coming soon.",
        f"{base} holders stay strong! We're in this for the long term.",
        f"Concerned about {base} volatility. Market conditions are uncertain.",
    ]
    
    mock_reddit_posts = [
        f"r/{base}: What do you think about the recent {base} developments?",
        f"r/{base}: {base} analysis - Technical indicators look positive",
        f"r/{base}: Should I buy {base} now or wait for a dip?",
        f"r/{base}: {base} community is growing! Adoption increasing.",
        f"r/{base}: Warning signs for {base}? Market analysis suggests caution.",
    ]
    
    mock_news = [
        f"{base} Announces Major Partnership with Leading Financial Institution",
        f"Regulatory Clarity Boosts {base} Market Confidence",
        f"{base} Network Upgrade Improves Transaction Speed",
        f"Market Analysts Raise Concerns About {base} Valuation",
        f"{base} Adoption Reaches New Milestone in Q1 2025",
    ]
    
    return {
        "tweets": mock_tweets,
        "reddit_posts": mock_reddit_posts,
        "news": mock_news
    }


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/sentiment/{symbol}")
def get_sentiment_analysis(symbol: str):
    """
    Get sentiment analysis for a cryptocurrency from social media and news sources.
    
    Uses NLP techniques (VADER or TextBlob) to analyze sentiment from:
    - Twitter/X
    - Reddit
    - News articles
    
    Returns overall sentiment score and breakdown by source.
    
    Args:
        symbol: Cryptocurrency symbol (e.g., 'BTCUSDT', 'ETHUSDT')
    
    Returns:
        Dictionary containing:
        - symbol: The cryptocurrency symbol
        - base: Base currency (e.g., 'BTC', 'ETH')
        - overall_sentiment: Overall sentiment ('positive', 'negative', 'neutral')
        - overall_score: Overall sentiment score (-1.0 to 1.0)
        - sentiment_distribution: Breakdown by sentiment type
        - sources: Detailed sentiment by source (Twitter, Reddit, News)
        - price_prediction_signal: Signal based on sentiment
        - recommendation: Trading recommendation (BUY, SELL, HOLD)
        - last_updated: Timestamp of analysis
    """
    base = symbol.replace('USDT', '').replace('USDC', '').upper()
    
    # Generate mock data (in production, fetch from APIs)
    mock_data = generate_mock_data(base)
    
    # Analyze Twitter/X sentiment
    twitter_sentiments = []
    for tweet in random.sample(mock_data["tweets"], min(5, len(mock_data["tweets"]))):
        sentiment, score = analyze_sentiment(tweet)
        twitter_sentiments.append({
            "text": tweet,
            "sentiment": sentiment,
            "score": round(score, 3),
            "timestamp": (time.time() - random.randint(0, 86400))
        })
    
    # Analyze Reddit sentiment
    reddit_sentiments = []
    for post in random.sample(mock_data["reddit_posts"], min(4, len(mock_data["reddit_posts"]))):
        sentiment, score = analyze_sentiment(post)
        reddit_sentiments.append({
            "text": post,
            "sentiment": sentiment,
            "score": round(score, 3),
            "timestamp": (time.time() - random.randint(0, 172800))
        })
    
    # Analyze News sentiment
    news_sentiments = []
    for news in random.sample(mock_data["news"], min(5, len(mock_data["news"]))):
        sentiment, score = analyze_sentiment(news)
        news_sentiments.append({
            "title": news,
            "sentiment": sentiment,
            "score": round(score, 3),
            "timestamp": (time.time() - random.randint(0, 259200)),
            "source": random.choice(["CoinDesk", "CoinTelegraph", "Decrypt", "The Block", "CryptoSlate"])
        })
    
    # Calculate overall sentiment scores
    all_scores = [item['score'] for item in twitter_sentiments + reddit_sentiments + news_sentiments]
    overall_score = sum(all_scores) / len(all_scores) if all_scores else 0.0
    
    # Count sentiments
    all_sentiments = [item['sentiment'] for item in twitter_sentiments + reddit_sentiments + news_sentiments]
    positive_count = all_sentiments.count('positive')
    negative_count = all_sentiments.count('negative')
    neutral_count = all_sentiments.count('neutral')
    total_count = len(all_sentiments)
    
    # Determine overall sentiment
    if overall_score > 0.1:
        overall_sentiment = "positive"
    elif overall_score < -0.1:
        overall_sentiment = "negative"
    else:
        overall_sentiment = "neutral"
    
    # Calculate percentages
    positive_pct = round((positive_count / total_count * 100), 1) if total_count > 0 else 0
    negative_pct = round((negative_count / total_count * 100), 1) if total_count > 0 else 0
    neutral_pct = round((neutral_count / total_count * 100), 1) if total_count > 0 else 0
    
    # Combine with on-chain metrics for price prediction signal
    # In production, fetch actual on-chain metrics
    onchain_signal = "bullish" if overall_sentiment == "positive" else "bearish" if overall_sentiment == "negative" else "neutral"
    
    return {
        "symbol": symbol,
        "base": base,
        "overall_sentiment": overall_sentiment,
        "overall_score": round(overall_score, 3),
        "sentiment_distribution": {
            "positive": {
                "count": positive_count,
                "percentage": positive_pct
            },
            "negative": {
                "count": negative_count,
                "percentage": negative_pct
            },
            "neutral": {
                "count": neutral_count,
                "percentage": neutral_pct
            }
        },
        "sources": {
            "twitter": {
                "sentiment": "positive" if sum(t['score'] for t in twitter_sentiments) > 0 else "negative" if sum(t['score'] for t in twitter_sentiments) < 0 else "neutral",
                "average_score": round(sum(t['score'] for t in twitter_sentiments) / len(twitter_sentiments), 3) if twitter_sentiments else 0,
                "posts": twitter_sentiments
            },
            "reddit": {
                "sentiment": "positive" if sum(r['score'] for r in reddit_sentiments) > 0 else "negative" if sum(r['score'] for r in reddit_sentiments) < 0 else "neutral",
                "average_score": round(sum(r['score'] for r in reddit_sentiments) / len(reddit_sentiments), 3) if reddit_sentiments else 0,
                "posts": reddit_sentiments
            },
            "news": {
                "sentiment": "positive" if sum(n['score'] for n in news_sentiments) > 0 else "negative" if sum(n['score'] for n in news_sentiments) < 0 else "neutral",
                "average_score": round(sum(n['score'] for n in news_sentiments) / len(news_sentiments), 3) if news_sentiments else 0,
                "articles": news_sentiments
            }
        },
        "price_prediction_signal": onchain_signal,
        "recommendation": "BUY" if overall_sentiment == "positive" and overall_score > 0.2 else "SELL" if overall_sentiment == "negative" and overall_score < -0.2 else "HOLD",
        "last_updated": time.time(),
        "analysis_method": "VADER" if vader_available else "TextBlob" if textblob_available else "Keyword-based"
    }


@app.get("/health")
def health_check():
    """Health check endpoint to verify service status and dependencies."""
    return {
        "status": "healthy",
        "service": "sentiment-service",
        "vader_available": vader_available,
        "textblob_available": textblob_available,
        "analysis_method": "VADER" if vader_available else "TextBlob" if textblob_available else "Keyword-based"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8008, reload=True)



