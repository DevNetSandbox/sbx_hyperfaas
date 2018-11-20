
import boto3
import os
from flask import request, Flask
from PIL import Image


app = Flask(__name__)

MINIO_HOST = "minio-service.hyperfaas.svc.cluster.local"
MINIO_PORT = 9000
MINIO_ACCESS_KEY = "minio"
MINIO_SECRET_KEY = "minio123"


def main():
    if request.data:
        app.logger.info(request.get_json())
        if request.get_json():

            my_key = request.get_json()["Key"]
            if not my_key:
                return "No content", 204

            minio_event = request.get_json()["EventType"]
            if minio_event != "s3:ObjectCreated:Put":
                return "Okay", 200

            uploads_bucket = my_key.split('/')[0]

            thumbnails_bucket = "thumbnails"

            filename = '/'.join(my_key.split('/')[1:])

            s3 = boto3.resource('s3',
                                endpoint_url="http://{}:{}".format(
                                    MINIO_HOST, MINIO_PORT),
                                aws_access_key_id=MINIO_ACCESS_KEY,
                                aws_secret_access_key=MINIO_SECRET_KEY,
                                config=boto3.session.Config(signature_version="s3v4"))

            my_object = s3.Object(uploads_bucket, filename)

            my_object.download_file('/tmp/{}'.format(filename))

            thumbnail_files = []
            thumbnail_sizes = [(128, 128), (256, 256), (512, 512)]

            for thumbnail_size in thumbnail_sizes:
                image_object = Image.open('/tmp/{}'.format(filename), 'r')

                image_name, image_extension = filename.split('.')

                thumbnail_file_name = "{}_thumb_{}_{}.{}".format(
                    image_name, thumbnail_size[0], thumbnail_size[1], image_extension
                )

                image_object.thumbnail(thumbnail_size)
                image_object.save("/tmp/{}".format(thumbnail_file_name))
                thumbnail_files.append(thumbnail_file_name)

            for thumb in thumbnail_files:
                my_object = s3.Object(thumbnails_bucket, thumb)
                my_object.upload_file("/tmp/{}".format(thumb))
                os.unlink('/tmp/{}'.format(thumb))

            return "Ok", 200
        else:
            return "No content", 204
    else:
        return "Dummy return."
