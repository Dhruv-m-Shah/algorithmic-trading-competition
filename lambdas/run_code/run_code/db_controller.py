import pymongo
from bson.objectid import ObjectId
import os
client = pymongo.MongoClient(
   f"mongodb+srv://db_user_read_write:{os.environ['DB_PASSWORD']}@cluster0.ob8gc.mongodb.net/{os.environ['DB_NAME']}?retryWrites=true&w=majority")
db = client["algorithmic_trading"]

def get_user_stocks(user_id, submission_id):
   print(user_id)
   return db["users"].find_one({"_id": ObjectId(user_id)}, { "submissions": 1})["submissions"][submission_id]

