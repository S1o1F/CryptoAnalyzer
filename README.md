#  CryptoAnalyzer System

A cryptocurrency analysis system with FastAPI backend and web frontend for viewing crypto data, technical indicators, and predictions.

## Setup Instructions
### 1. Install Dependencies
pip install -r requirements.txt
### 2. Configure NewsAPI Key
For enhanced news sentiment analysis:

- Copy `.env.example` to `.env`
- Add your NewsAPI key: `NEWS_API_KEY=your_key_here`
- Get a free key at: https://newsapi.org/register
### 3. Initialize Database
Run the data pipeline to populate the database:

python data_pipeline.py

This will:
- Create the database in `database/data.db`
- Fetch cryptocurrency data from Binance
- Populate the database with historical price data
### 4. Generate Frontend Data

To generate the JSON file for the frontend prototype:

python export_to_json.py

This creates `prototype/data/crypto_data.json` which is used by the frontend.

### 5.Generate LSTM Models
The repository includes 5 example LSTM models for demonstration purposes. To train models for all cryptocurrencies in the database:

python lstm_prediction.py

**Note:** 
- This requires the database to be populated first (step 3)
- Training can take a significant amount of time depending on the number of symbols
- Models are saved to `models/` directory
- Performance metrics are saved to `models/metrics/` directory

The API endpoint `/lstm/predict/{symbol}` uses these models for price predictions. 

## Running the Application
Manual Start
1. Start the server: 
   python main.py
2. Open `prototype/index.html` in your browser
## Accessing the Application

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Frontend**: Opens automatically in browser, or navigate to `prototype/index.html`
