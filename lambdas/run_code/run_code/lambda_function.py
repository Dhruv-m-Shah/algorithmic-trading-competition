import json
import yfinance as yf

from helper import store_new_info


class Portfolio:
    def __init__(self, stocks, cash):
        self.stocks = stocks
        self.cash = cash
    def buy_stock(self, ticker, amount):
        try:
            print("TEST")
            stock_ticker = yf.Ticker(ticker)
            todays_data = stock_ticker.history(period='1d')
            price = todays_data["Close"][0]
            
            if(price*amount > self.cash):
                print("TEST123")
                return False
            else:
                print("TEST456")
                self.cash -= price*amount
                if(ticker in self.stocks):
                    
                    self.stocks[ticker]['shares'] += amount
                else:
                    print("ABC")
                    self.stocks[ticker] = {}
                    self.stocks[ticker]['shares'] = amount
                    print(self.stocks)
                print(self.stocks)
        except Exception as e:
            print(e)
            return False
    def sell_stock(self, ticker, amount):
        try:
            stock_ticker = yf.Ticker(ticker)
            todays_data = stock_ticker.history(period='1d')
            price = todays_data["Close"][0]
            if(ticker not in self.stocks or self.stocks[ticker]['shares'] < amount):
                return False
            else:
                self.cash += price*amount
                self.stocks[ticker]['shares'] -= amount
        except Exception as e:
            print(e)
            return False
    def get_cash(self):
        return self.cash
    def get_portfolio(self):
        return self.stocks


def lambda_handler(event, context):
    print(event)
    # Return last 100 closing prices for s&p500
    if("updateStandardStock" in event):
        # ^GSPC is the ticker name for S&P500
        stock_ticker = yf.Ticker("^GSPC")
        # a pandas dataframe is returned
        data = stock_ticker.history(period='100d')
        ret = []
        for i in range(len(data)):
            d = {}
            d['date'] = str(data.index[i])
            d['close'] = data["Close"][i]
            ret.append(d)
        return {
            'statusCode': 200,
            'standardAndPoors100d': ret
        }

    code = event["code"]
    cash = event["cash"]
    stocks = event["stocks"]
    user_id = event["user_id"]
    submission_id = event["submission_id"]
    error = None
    portfolio = Portfolio(stocks, cash)
    try:
        exec(code)
    except Exception as e:
        error = e
    
    print(portfolio.get_portfolio())
    store_new_info(user_id, submission_id, portfolio.get_portfolio(), portfolio.get_cash())

    return {
        "stocks": portfolio.get_portfolio(),
        "cash": portfolio.get_cash(),
        "error": error
    }

