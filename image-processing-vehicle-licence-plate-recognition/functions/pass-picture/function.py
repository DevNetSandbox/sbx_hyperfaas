import boto3
import os
import io
import sys

from flask import request, Flask

app = Flask(__name__)

MINIO_HOST = "minio-service.hyperfaas.svc.cluster.local"
MINIO_PORT = 9000
MINIO_ACCESS_KEY = "minio"
MINIO_SECRET_KEY = "minio123"


def main():
    if request.data:
        app.logger.info(request.get_json())

        if request.get_json():
            bucket = request.get_json()["Object"]["bucket"]

            if not bucket:
                return "No content", 204

            image_object = request.get_json()["Object"]["image_object"]

            if not image_object:
                return "No content", 204

            image_id = request.get_json()["Object"]["_id"]

            if not image_id:
                return "No content", 204

            filename = "/tmp/{}".format(image_id)

            s3 = boto3.resource('s3',
                                endpoint_url="http://{}:{}".format(
                                    MINIO_HOST, MINIO_PORT),
                                aws_access_key_id=MINIO_ACCESS_KEY,
                                aws_secret_access_key=MINIO_SECRET_KEY,
                                config=boto3.session.Config(signature_version="s3v4"))

            my_object = s3.Object(bucket, "/{}".format(image_object))

            my_object.download_file(filename)

            with io.open(filename, 'rb') as image_file:
                content = image_file.read()

            print("1" + image_file, file=sys.stderr)
            print("2" + str(image_file), file=sys.stderr)
            print("3" + content, file=sys.stderr)
            print("4" + str(content), file=sys.stderr)
            return str(content)
        else:
            return "No content", 204
