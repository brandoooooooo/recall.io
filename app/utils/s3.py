# TODO get s3 files from a specific folder object key testing with test/* files
import os
import boto3
from dotenv import load_dotenv

load_dotenv()

S3_BUCKET = os.environ.get("VITE_BUCKET", "")
if S3_BUCKET == "":
    raise Exception("need bucket name")


USER_AWS_ACCESS_KEY_ID = os.environ.get("USER_AWS_ACCESS_KEY_ID")
USER_AWS_SECRET_ACCESS_KEY = os.environ.get("USER_AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.environ.get("AWS_REGION")

s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=USER_AWS_ACCESS_KEY_ID,
    aws_secret_access_key=USER_AWS_SECRET_ACCESS_KEY,
)

resource = boto3.resource(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=USER_AWS_ACCESS_KEY_ID,
    aws_secret_access_key=USER_AWS_SECRET_ACCESS_KEY,
)


# TODO: get from env
def get_s3_file(object_key) -> bytes:
    try:
        response = s3.get_object(Bucket=S3_BUCKET, Key=object_key)
        return response["Body"].read()
    except Exception as e:
        print(e)
        raise e


def get_s3_file_size(object_key) -> int:
    try:
        return resource.Object(bucket_name=S3_BUCKET, key=object_key).content_length
    except Exception as e:
        print(e)
        raise e
