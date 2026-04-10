from pymongo import MongoClient
import os
# from dotenv import load_dotenv  -when on local host

# load_dotenv()                   -when on local host

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["NeuroSentix"]

collection = db["reviews"]