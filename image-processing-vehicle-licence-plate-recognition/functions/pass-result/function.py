import pymongo
import sys

from flask import request, Flask

app = Flask(__name__)

MONGODB_HOST = "mongo-db.hyperfaas.svc.cluster.local"
MONGODB_PORT = 27017

MONGODB_DATABASE = "image-processing"
MONGODB_COLLECTION_RECOGNIZED = "recognized-plates"
MONGODB_COLLECTION_NOT_RECOGNIZED = "not-recognized-plates"


def main():
    if request.data:
        app.logger.info(request.get_json())
        if request.get_json():
            plate = request.get_json()["plate"]

            if not plate:
                return "No content", 204

            mongo_url = "mongodb://{}".format(MONGODB_HOST)

            client = pymongo.MongoClient(mongo_url, MONGODB_PORT)

            recognized = request.get_json()["recognized"]
            if recognized:
                collection = client[MONGODB_DATABASE][MONGODB_COLLECTION_RECOGNIZED]
                insertion_object = {
                    "_id": request.get_json()["name"],
                    "plate": request.get_json()["plate"],
                    "recognized": request.get_json()["recognized"],
                    "confidence": request.get_json()["confidence"]
                }
            else:
                collection = client[MONGODB_DATABASE][MONGODB_COLLECTION_NOT_RECOGNIZED]
                insertion_object = {
                    "_id": request.get_json()["name"],
                    "plate": request.get_json()["plate"]
                }
            print(str(insertion_object), file=sys.stderr)
            try:
                insert_one = collection.insert_one(insertion_object)
                return str(insertion_object)
            except pymongo.errors.PyMongoError:
                print("mongo insert error")
                return "Not good", 400
        else:
            return "No content", 204
