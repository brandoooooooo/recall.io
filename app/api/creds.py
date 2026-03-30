from datetime import datetime, timedelta
import boto3
from flask import jsonify
from sqlalchemy import select
from sqlalchemy.sql import func
from app.models.sts_token import StsToken, StsTokenSchema
from app.utils.base import abort, response, routes, session, request
from app.utils.crud import GET
from app.utils.security import protected

ROLLING_WINDOW_THRESHOLD = 10 * 60
THRESHOLD_MAX_ALLOWED = 2

sts = boto3.client("sts")


@response(
    StsTokenSchema(
        only=["access_key_id", "secret_access_key", "session_token", "expiration"]
    )
)
def get_temp_aws_creds():
    """Provide temporary STS credentials for client AWS S3 upload."""
    # issue rate-limit
    threshold = datetime.now() - timedelta(seconds=ROLLING_WINDOW_THRESHOLD)
    no_created_in_window = session.scalar(
        select(func.sum(1))
        .select_from(StsToken)
        .where(
            StsToken.user_id == request.user.id,
            StsToken.date_created > threshold,
        )
    )
    active_tokens = (
        session.query(StsToken)
        .where(
            StsToken.user_id == request.user.id, StsToken.expiration > datetime.now()
        )
        .order_by(StsToken.date_created)
        .all()
    )
    if (
        no_created_in_window
        and no_created_in_window > THRESHOLD_MAX_ALLOWED
        and len(active_tokens) == 0
    ):
        abort("rate limit", 401)

    if len(active_tokens) > 0:
        return active_tokens[0]

    # no rate limit and token doesn't exist, get token from AWS
    try:
        response = sts.assume_role(
            RoleArn="arn:aws:iam::474668419736:role/RecallS3",
            RoleSessionName="multipart-upload-session",
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    credentials = response["Credentials"]
    sts_token = StsToken(
        access_key_id=credentials["AccessKeyId"],
        secret_access_key=credentials["SecretAccessKey"],
        session_token=credentials["SessionToken"],
        expiration=credentials["Expiration"],
        user_id=request.user.id,
    )
    session.add(sts_token)
    session.commit()
    return sts_token


cred_routes = routes(
    GET("/temp-upload-creds", get_temp_aws_creds),
    decorators=[protected],
)
