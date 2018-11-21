module.exports = async function (context) {
    var gm = require('gm').subClass({ imageMagick: true });
    var Minio = require('minio')
    var mongoose = require('mongoose');

    var ImageSchema = new mongoose.Schema({
        "bucket": String,
        "image_object": String,
        "Format": String,
        "format": String,
        "Class": String,
        "Geometry": String,
        "size": {
            "width": Number,
            "height": Number
        },
        "Resolution": String,
        "Print size": String,
        "Units": String,
        "Type": String,
        "Endianess": String,
        "Colorspace": String,
        "Depth": String,
        "depth": Number,
        "Channel depth": {
            "red": String,
            "green": String,
            "blue": String
        },
        "Channel statistics": {
            "Red": {
                "min": String,
                "max": String,
                "mean": String,
                "standard deviation": String,
                "kurtosis": String,
                "skewness": String
            },
            "Green": {
                "min": String,
                "max": String,
                "mean": String,
                "standard deviation": String,
                "kurtosis": String,
                "skewness": String
            },
            "Blue": {
                "min": String,
                "max": String,
                "mean": String,
                "standard deviation": String,
                "kurtosis": String,
                "skewness": String
            }
        },
        "Image statistics": {
            "Overall": {
                "min": String,
                "max": String,
                "mean": String,
                "standard deviation": String,
                "kurtosis": String,
                "skewness": String
            }
        },
        "Rendering intent": String,
        "Gamma": String,
        "Chromaticity": {
            "red primary": String,
            "green primary": String,
            "blue primary": String,
            "white point": String
        },
        "Interlace": String,
        "Background color": String,
        "Border color": String,
        "Matte color": String,
        "Transparent color": String,
        "Compose": String,
        "Page geometry": String,
        "Dispose": String,
        "Iterations": String,
        "Compression": String,
        "Quality": String,
        "Orientation": String,
        "Properties": {
            "date:create": String,
            "date:modify": String,
            "exif:ApertureValue": String,
            "exif:BrightnessValue": String,
            "exif:ColorSpace": String,
            "exif:ComponentsConfiguration": String,
            "exif:Compression": String,
            "exif:DateTime": String,
            "exif:DateTimeDigitized": String,
            "exif:DateTimeOriginal": String,
            "exif:ExifImageLength": String,
            "exif:ExifImageWidth": String,
            "exif:ExifOffset": String,
            "exif:ExifVersion": String,
            "exif:ExposureBiasValue": String,
            "exif:ExposureMode": String,
            "exif:ExposureProgram": String,
            "exif:ExposureTime": String,
            "exif:Flash": String,
            "exif:FlashPixVersion": String,
            "exif:FNumber": String,
            "exif:FocalLength": String,
            "exif:FocalLengthIn35mmFilm": String,
            "exif:GPSAltitude": String,
            "exif:GPSAltitudeRef": String,
            "exif:GPSDateStamp": String,
            "exif:GPSInfo": String,
            "exif:GPSLatitude": String,
            "exif:GPSLatitudeRef": String,
            "exif:GPSLongitude": String,
            "exif:GPSLongitudeRef": String,
            "exif:GPSTimeStamp": String,
            "exif:GPSVersionID": String,
            "exif:ImageUniqueID": String,
            "exif:InteroperabilityIndex": String,
            "exif:InteroperabilityOffset": String,
            "exif:InteroperabilityVersion": String,
            "exif:ISOSpeedRatings": String,
            "exif:JPEGInterchangeFormat": String,
            "exif:JPEGInterchangeFormatLength": String,
            "exif:Make": String,
            "exif:MeteringMode": String,
            "exif:Model": String,
            "exif:ResolutionUnit": String,
            "exif:SceneCaptureType": String,
            "exif:SceneType": String,
            "exif:SensingMethod": String,
            "exif:ShutterSpeedValue": String,
            "exif:Software": String,
            "exif:SubSecTime": String,
            "exif:SubSecTimeDigitized": String,
            "exif:SubSecTimeOriginal": String,
            "exif:WhiteBalance": String,
            "exif:XResolution": String,
            "exif:YCbCrPositioning": String,
            "exif:YResolution": String,
            "jpeg:colorspace": String,
            "jpeg:sampling-factor": String,
            "signature": String
        },
        "Profiles": {
            "Profile-exif": String,
            "Profile-icc": {
                "Description": String,
                "Manufacturer": String,
                "Model": String,
                "Copyright": String
            },
            "Profile-xmp": String
        },
        "Artifacts": {
            "filename": String,
            "verbose": String
        },
        "Tainted": String,
        "Filesize": String,
        "Number pixels": String,
        "Pixels per second": String,
        "User time": String,
        "Elapsed time": String,
        "Version": String,
        "path": String
    }, { collection: "images" }
    );
    //module.exports = ImageSchema


    var imagePath = context.request.body.Key;

    var minioEndPoint = 'minio-service.hyperfaas.svc.cluster.local';
    var minioPort = 9000;
    var minioAccesKey = 'minio';
    var minioSecretKey = 'minio123';

    // minio connector
    var minioClient = new Minio.Client({
        endPoint: minioEndPoint,
        port: minioPort,
        secure: false,
        accessKey: minioAccesKey,
        secretKey: minioSecretKey
    });

    if (imagePath) { // check if there is filepath in body to prevent initial crash
        var bucketToCopy = 'thumbnails';
        var newFileName = 'tmp_' + imagePath.split('/')[1];
        var conds = new Minio.CopyConditions();
        minioClient.copyObject(bucketToCopy, newFileName, '/' + imagePath, conds, function (e, data) {
            if (e) {
                return console.log(e)
            }

            minioClient.fGetObject(bucketToCopy, newFileName, '/tmp/' + newFileName, function (err) {
                if (err) {
                    console.log('fGetObject', err)
                }
                gm('/tmp/' + newFileName).identify(function (err, data) {
                    console.log('identify');
                    if (err) {
                        console.log('identify', err)
                    }

                    var mongoDatabase = "image-metadata"
                    var mongoUrl = 'mongodb://mongo-db.hyperfaas.svc.cluster.local/' + mongoDatabase;
                    insertData(mongoUrl, data);
                    minioClient.removeObject(bucketToCopy, newFileName, function (err) {
                        if (err) {
                            console.log('removeObject', err)
                        }
                        console.log('Removed the object')
                    })
                })
            })
        });

    }


    // mongodb connector

    function insertData(mongoUrl, data) {

        var db = mongoose.createConnection(mongoUrl);
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));

        data.bucket = imagePath.split(/([^/]*)\/(.*)/)[1];
        data.image_object = imagePath.split(/([^/]*)\/(.*)/)[2];
        console.log(data);
        var Img = db.model('Img', ImageSchema);
        Img.create(data, function (err, ok) {
            if (err) return console.log(err);
        });
    }

    return {
        status: 200,
        body: "Hello from process-image-metadata in NodeJS environment!\n"
    };
}
