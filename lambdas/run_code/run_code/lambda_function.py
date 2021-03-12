import json
import yfinance as yf
from .db_controller import get_user_stocks

class Portfolio:
    def __init__(self, stocks, cash):
        self.stocks = stocks
        self.cash = cash
    def buy_stock(self, ticker, amount):
        try:
            stock_ticker = yf.Ticker(ticker)
            todays_data = stock_ticker.history(period='1d')
            price = todays_data["Close"][0]
            if(price*amount > self.cash):
                return False
            else:
                self.cash -= price*amount
                if(ticker in self.stocks):
                    self.stocks[ticker] += amount
                else:
                    self.stocks[ticker] = amount
        except Exception as e:
            print(e)
            return False
    def sell_stock(self, ticker, amount):
        try:
            stock_ticker = yf.Ticker(ticker)
            todays_data = ticker.history(period='1d')
            price = todays_data["Close"][0]
            if(ticker not in self.stocks or self.stocks[ticker] < amount):
                return False
            else:
                self.cash += price*amount
                self.stocks[ticker] -= amount
        except Exception as e:
            return False
    def get_cash(self):
        return self.cash
    def get_portfolio(self):
        return self.stocks


def lambda_handler(event, context):
    event = json.loads(event)
    code = event["code"]
    cash = event["cash"]
    stocks = event["stocks"]
    error = None
    portfolio = Portfolio(stocks, cash)
    try:
        exec(code)
    except Exception as e:
        error = e

    return {
        "stocks": portfolio.get_portfolio(),
        "cash": portfolio.get_cash(),
        "error": error
    }

