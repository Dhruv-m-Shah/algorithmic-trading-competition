import json
import yfinance as yf


class Portfolio:
    def __init__(self, stocks, cash, date):
        self.stocks = stocks
        self.cash = cash
        self.date = date # today's date
    def buy_stock(self, ticker, amount):
        try:
            stock_ticker = yf.Ticker(ticker)
            todays_data = ticker.history(period='1d')
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
    def get_cash():
        return self.cash
    def get_portfolio():
        return self.stocks

portfolio = Portfolio()

def lambda_handler(event, context):
    code = event["code"]
    user_id = event["user_id"]
    submission_id = event["submission_id"]


