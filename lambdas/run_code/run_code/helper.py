import requests
import json
import os
import yfinance as yf

BASE_ENDPOINT = os.environ['BASE_ENDPOINT']

def store_new_info(user_id, submission_id, portfolio, cash):
    url = BASE_ENDPOINT + '/updateUserPortfolio'
    modified_portfolio  = {}
    for ticker in portfolio:
        stock_ticker = yf.Ticker(ticker)
        todays_data = stock_ticker.history(period='1d')
        price = todays_data["Close"][0]
        modified_portfolio[ticker] = [portfolio[ticker], price]
        
    payload = {
        'portfolio': modified_portfolio,
        'cash': cash,
        'user_id': user_id,
        'submission_id': submission_id
    }

    headers = {'Content-Type': 'application/json'}
    response = requests.request("POST", 
    url,
    headers = headers,
    data=json.dumps(payload))
