import pymongo
import os
client = pymongo.MongoClient(
   f"mongodb+srv://db_user_read_write:{os.environ["DB_PASSWORD"]}@cluster0.ob8gc.mongodb.net/{os.environ["DB_NAME"]}?retryWrites=true&w=majority")
db = client["algorithmic_trading"]

