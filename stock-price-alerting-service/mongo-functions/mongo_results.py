import pymongo
import json

from flask import request, Flask, Response

MONGODB_HOST = "mongo-db.hyperfaas.svc.cluster.local"
MONGODB_PORT = 27017

def main():
    try:
        mongodb_host = request.args.get("mongodb_host") if request.args.get("mongodb_host") else MONGODB_HOST
        mongodb_port = request.args.get("mongodb_port") if request.args.get("mongodb_port") else MONGODB_PORT
        mongodb_database = request.args.get("mongodb_database")
        mongodb_collection = request.args.get("mongodb_collection")
        if not mongodb_database or not mongodb_collection:
            return response({"error": {"message": "Please specify mongodb_database and mongodb_collection as query params"}}, 400)
        

        client = pymongo.MongoClient("mongodb://{}".format(mongodb_host), int(mongodb_port))
        collection = client[mongodb_database][mongodb_collection]
        
        result = []
        for doc in collection.find({}):
            result.append({"symbol": doc["symbol"], "price": doc["price"]})

        return response(json.dumps(result, indent=2), 200)
    except pymongo.errors.PyMongoError as err:
        return response({"error": "MongoDB error: " + str(err)}, 500)
    except Exception as err:
        return response({"error": str(err)}, 500)

def response(body, status):
    return Response(str(body), status, {"Content-Type": "application/json"})
