from flask import request


def main():
    number = 0
    if request.data:
        data = request.get_json()  # returns valid json
        if "number"in data:
            number = data["number"]
    return "Hello, number %s, you are <50 and you are welcomed from Python function!\n" % number
