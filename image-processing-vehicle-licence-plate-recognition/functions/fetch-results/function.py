import os
import json
import pymongo

MONGODB_HOST = "mongo-db.hyperfaas.svc.cluster.local"
MONGODB_PORT = 27017
MONGODB_DATABASE = "image-processing"
MONGODB_COLLECTION = "recognized-vehicle-license-plates"
MONGODB_URL = "mongodb://{}".format(MONGODB_HOST)


def main():
    client = pymongo.MongoClient(MONGODB_URL, MONGODB_PORT)

    collection = client[MONGODB_DATABASE][MONGODB_COLLECTION]

    documents_cursor = collection.find({})

    return json.dumps([{
        "ID": document['_id'],
        "plate": document['plate'],
        "confidence": document['confidence'],
        "recognized": document['recognized']
    } for document in documents_cursor], indent=2)


if __name__ == '__main__':
    print(main())
