import datetime
from functools import wraps
from http.client import HTTPException
import os
import re
import uuid
from flask import jsonify, request as flask_request
import flask
from typing import (
    TYPE_CHECKING,
    Any,
    Callable,
    List,
    NoReturn,
    Optional,
    Type,
    TypeVar,
    Union,
)
from dotenv import load_dotenv
from marshmallow import Schema, ValidationError
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
import sqlalchemy as sa
from sqlalchemy.orm import (
    DeclarativeBase,
    sessionmaker,
    scoped_session,
    Mapped,
    mapped_column,
)
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declared_attr
from werkzeug.local import LocalProxy
from werkzeug.exceptions import HTTPException as WzHTTPException

# keep this
# try:
#     from greenlet import getcurrent as _ident_func
# except ImportError:
from threading import get_ident as _ident_func

load_dotenv()

# Public DB on railway DO NOT USE THIS UNLESS IN PROD
# SQLALCHEMY_DATABASE_URI = os.environ["RAILWAY_URI"]

SQLALCHEMY_DATABASE_URI = os.environ["SQLALCHEMY_DATABASE_URI"]

# TODO: add observability for connection pool and scoped session registry
engine = sa.create_engine(SQLALCHEMY_DATABASE_URI, pool_size=100)
session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
session = scoped_session(session_factory, scopefunc=_ident_func)


# ref: https://docs.sqlalchemy.org/en/20/orm/declarative_mixins.html
class Base(DeclarativeBase):
    @declared_attr.directive
    def __tablename__(cls):
        # this translates the class name (likely PascalCase) to snake_case
        return re.sub(r"(?<!^)([A-Z])", r"_\1", cls.__name__).lower().lstrip("_")


if TYPE_CHECKING:
    from app.models.user import User
else:
    User = "User"


# https://werkzeug.palletsprojects.com/en/2.3.x/local/
class TypedRequest(LocalProxy):
    @property
    def user(self) -> User:
        return super().user  # type: ignore

    @property
    # TODO: type this
    def user_claims(self) -> dict:
        return super().user_claims  # type: ignore


request = TypedRequest(lambda: flask_request)

ModelType = TypeVar("ModelType", bound=Base)


def AutoSchema(
    model_type: Type[ModelType],
    foreign_keys: bool = False,
    excluded: List[str] = [],
) -> Type[SQLAlchemyAutoSchema]:
    class AutoSchemaInner(SQLAlchemyAutoSchema):
        class Meta:
            load_instance = True
            sqla_session = session
            model = model_type
            include_fk = foreign_keys
            exclude = excluded

    return AutoSchemaInner


class Identified:
    # mixin to provide id to model
    __abstract__ = True
    id: Mapped[str] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4
    )


class Deleted:
    __abstract__ = True
    deleted: Mapped[bool] = mapped_column(sa.Boolean(), nullable=False, default=False)


class Resource(Identified):
    # provide date_{created, updated} fields to model
    __abstract__ = True
    date_created: Mapped[datetime.datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    date_updated: Mapped[datetime.datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class AbortException(Exception):
    def __init__(self, abort_message, status_code, *args: object) -> None:
        self.abort_message = abort_message
        self.status_code = status_code
        super().__init__(*args)


def abort(message: str, status_code: int = 400) -> NoReturn:
    try:
        flask.abort(status_code, description=message)
    except HTTPException as err:
        err.description = message  # type: ignore
        raise err


def response(schema: Schema, status_code: int = 200, **extra):
    def decorator(func):
        @wraps(func)
        def inner(*args, **kwargs):
            res = func(*args, **kwargs)

            try:
                serialized = schema.dump(res, **extra)
                return serialized, status_code
            except ValidationError as e:
                # TODO: should log error internally and return something else
                return jsonify({"error": e.messages}), 500

        return inner

    return decorator


def argument(schema: Schema, **extra):
    def decorator(func):
        @wraps(func)
        def inner(*args, **kwargs):
            # TODO: when needed, modify this to accept stuff other than request.json
            try:
                req_json = schema.load(request.json, **extra)  # type: ignore
            except WzHTTPException as e:
                return jsonify({"error": e.description}), e.code
            except Exception as e:
                print("argument error", e)
                return jsonify({"error": "error"}), 500

            return func(req_json, *args, **kwargs)

        return inner

    return decorator


def routes(
    *routes: Union[tuple, Callable[[Callable, list[Callable]], None]],
    decorators: Optional[list[Any]] = None,
):
    """Route abstraction

    Routes can
        1. be defined with a tuple in the form (relative_path, routes: Callable, decorators: Optional[Callable])
        2. terminate with a (router: Callable) -> None that invokes `add_url_rule`

    In other words, the route definition can be nested.
    """
    global_decorators = decorators or []

    def inner(register: Callable):
        for route in routes:
            # handle nested declaration
            if isinstance(route, tuple):
                path, route_fn = route[0], route[1]
                route_decorators = route[2] if len(route) > 2 else None

                def helper(sub_path: str, method: str, endpoint: Callable):
                    # same function signature as register but helps extend subpaths
                    # if local route_decorators is defined (ie can be empty, []), use it otherwise use globals
                    local_decorators = (
                        global_decorators
                        if route_decorators is None
                        else route_decorators
                    )
                    for decorator in local_decorators:
                        # wrap the function with the decorator
                        endpoint = decorator(endpoint)
                    register(f"{path}{sub_path}", method, endpoint)

                route_fn(helper)
            # flat declaration
            else:
                route(register, global_decorators or [])

    return inner
