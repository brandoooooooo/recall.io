from functools import wraps
from typing import Callable, Optional

from flask import request

from app.models.user import User

from .jwt import decode
from .base import session


def setup_request(token: Optional[str], inject_user: bool = True):
    if token is None:
        raise Exception("no token")

    if token.startswith("Bearer"):
        token = token.split(" ")[-1]

    try:
        decoded_token = decode(token)
        request.user_claims = decoded_token  # type: ignore
        user_email = decoded_token.get("email")  # type: ignore

        if not inject_user:
            return

        user = session.query(User).where(User.email == user_email).one_or_none()
        if not user:
            raise Exception("user not found")
        request.user = user  # type: ignore
    except ValueError as e:
        raise Exception("Invalid token provided.") from e


def protected(func: Callable, inject_user: bool = True):
    """Auth protected route

    Modifies flask's request
    """

    @wraps(func)
    def wrap(*args, **kwargs):
        # if already has user embedded in request, good
        if hasattr(request, "user"):
            return func(*args, **kwargs)

        # else inject it
        try:
            setup_request(request.headers.get("Authorization"), inject_user)
        except Exception as e:
            print("protected error", e)
            return {"message": "error"}, 401

        return func(*args, **kwargs)

    return wrap
