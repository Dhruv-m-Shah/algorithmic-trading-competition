import json

import pytest

from run_code import lambda_function

def test_lambda_handler():
    with open('testsLocal/test1.json') as f:
        d = json.load(f)
    ret = lambda_function.lambda_handler(d, None)
    print(ret)