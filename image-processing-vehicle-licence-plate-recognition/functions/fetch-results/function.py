import os
import json
import pymongo

MONGODB_HOST = "mongo-db.hyperfaas.svc.cluster.local"
MONGODB_PORT = 27017
MONGODB_DATABASE = "image-processing"
MONGODB_COLLECTION_RECOGNIZED = "recognized-plates"
MONGODB_COLLECTION_NOT_RECOGNIZED = "not-recognized-plates"
MONGODB_URL = "mongodb://{}".format(MONGODB_HOST)


def main():
    client = pymongo.MongoClient(MONGODB_URL, MONGODB_PORT)

    collection_recognized = client[MONGODB_DATABASE][MONGODB_COLLECTION_RECOGNIZED]
    collection_not_recognized = client[MONGODB_DATABASE][MONGODB_COLLECTION_NOT_RECOGNIZED]

    documents_cursor_recognized = collection_recognized.find({})
    documents_cursor_not_recognized = collection_not_recognized.find({})

    # return ("Recognized:\n" +
    #         json.dumps([{
    #             "ID": document['_id'],
    #             "plate": document['plate'],
    #             "confidence": document['confidence'],
    #             "recognized": document['recognized']
    #         } for document in documents_cursor_recognized], indent=2) +
    #         "\nNot Recognized:\n" +
    #         json.dumps([{
    #             "ID": document['_id'],
    #             "plate": document['plate']
    #         } for document in documents_cursor_not_recognized], indent=2))

    return ("Recognized:\n" + json.dumps([{
        "ID": document['_id'],
        "plate": document['plate'],
        "confidence": document['confidence'],
        "recognized": document['recognized']
    } for document in documents_cursor_recognized], indent=2))


if __name__ == '__main__':
    print(main())
