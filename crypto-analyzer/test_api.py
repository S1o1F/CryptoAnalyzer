"""
proverka dali rabotit api
run ot ko kje se strat server
"""
import requests

BASE_URL = "http://127.0.0.1:8000"


def test_api():
    print("Testing FastAPI endpoints...\n")

    # Test 1: Get all symbols
    print("1. Testing /symbols endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/symbols")
        if response.status_code == 200:
            symbols = response.json()
            print(f"   ✓ Success! Found {len(symbols)} symbols")
            if symbols:
                print(f"   First symbol: {symbols[0]['symbol']}")
        else:
            print(f"   ✗ Error: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Error: {e}")

    # Test 2: Get latest price
    print("\n2. Testing /symbols/{symbol}/latest endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/symbols")
        if response.status_code == 200:
            symbols = response.json()
            if symbols:
                test_symbol = symbols[0]['symbol']
                response = requests.get(f"{BASE_URL}/symbols/{test_symbol}/latest")
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✓ Success! Latest price for {test_symbol}:")
                    print(f"   Price: ${data.get('close', 'N/A')}")
                else:
                    print(f"   ✗ Error: {response.status_code}")
            else:
                print("   ⚠ No symbols available to test")
    except Exception as e:
        print(f"   ✗ Error: {e}")

    # Test 3: Test technical analysis
    print("\n3. Testing /analysis/{symbol} endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/symbols")
        if response.status_code == 200:
            symbols = response.json()
            if symbols:
                test_symbol = symbols[0]['symbol']
                response = requests.get(f"{BASE_URL}/analysis/{test_symbol}?timeframe=1d")
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✓ Success! Technical analysis for {test_symbol}:")
                    print(f"   Overall Signal: {data.get('summary', {}).get('overall_signal', 'N/A')}")
                    print(f"   Current Price: ${data.get('current_price', 'N/A')}")
                else:
                    print(f"   ✗ Error: {response.status_code} - {response.text}")
            else:
                print("   ⚠ No symbols available to test")
    except Exception as e:
        print(f"   ✗ Error: {e}")

    print("\n" + "=" * 50)
    print("Test complete! Check the results above.")
    print("=" * 50)


if __name__ == "__main__":
    test_api()

