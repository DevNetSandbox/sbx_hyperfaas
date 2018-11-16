import pymongo

from flask import request, Flask, Response

def main():
    if request.data:
        if request.get_json():
            try:
                request_data = request.get_json()
                mongodb_host = request_data["mongodb_host"]
                mongodb_port = request_data["mongodb_port"]
                mongodb_database = request_data["mongodb_database"]
                mongodb_collection = request_data["mongodb_collection"]
                symbol = request_data["symbol"]
                price = request_data["price"]

                client = pymongo.MongoClient("mongodb://{}".format(mongodb_host), int(mongodb_port))
                collection = client[mongodb_database][mongodb_collection]

                # Update or insert one
                collection.replace_one({"symbol": symbol}, {"symbol": symbol, "price": price}, True)
                return response({"status": "updated", "symbol": symbol, "price": price}, 200)
            except pymongo.errors.PyMongoError as err:
                return response({"error": "MongoDB insert error: " + str(err)}, 500)
            except Exception as err:
                return response({"error": "Error storing price: " + str(err)}, 500)
        else:
            return response({"message": "No content"}, 204)
    else:
        return None

def response(body, status):
    return Response(str(body), status, {"Content-Type": "application/json"})
