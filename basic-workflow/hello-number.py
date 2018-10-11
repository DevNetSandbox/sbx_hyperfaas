from flask import request


def main():
    if request.data:
        data = request.get_json()  # returns valid json
        number = data["number"]
    return "Hello, %s!" % number
