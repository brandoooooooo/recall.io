import datetime
from functools import partial
from uuid import uuid4
from sqlalchemy import select
from app.models.folder import Folder
from app.models.user import User, UserSchema
from app.utils.base import abort, argument, response, routes, request
from app.utils.crud import GET, POST
from app.utils.security import protected
from app.utils.base import session


@response(UserSchema(exclude=["date_created", "date_updated", "deleted"]))
def get_self():
    if request.user is None:
        abort("no user", 400)
    return request.user


@argument(UserSchema(only=["display_name"]))
def add_user(data):
    user_email = request.user_claims.get("email", None)
    # this is 99% redundant
    if user_email is None:
        abort("error", 400)

    user_exists = session.scalar(
        select(1).select_from(User).where(User.email == user_email)
    )
    if user_exists:
        return {}

    user_id = uuid4()
    folder = Folder(path="/", user_id=user_id)

    data.email = user_email
    data.id = user_id
    session.add(data)
    session.add(folder)
    session.commit()
    return {}


def accept_aup():
    user = request.user
    if user.accepted_aup is not None:
        abort("already accepted aup", 400)

    user.accepted_aup = datetime.datetime.now()
    session.add(user)
    session.commit()
    return {}


user_routes = routes(
    GET("/self", get_self),
    # POST("", add_user),
    POST("/aup/accept", accept_aup),
    decorators=[protected],
)

user_routes_unprotected = routes(
    POST("", add_user),
    decorators=[partial(protected, inject_user=False)],
)
