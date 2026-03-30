from uuid import uuid4
from sqlalchemy import select
from app.models.chat import Chat
from app.models.collection import Collection, CollectionSchema
from app.models.collection_source import CollectionSource
from app.models.document import Document
from app.models.temp import (
    ChatSchema2,
    CollectionSchema2,
    chat_message_schema,
    CreateChatSchema,
)
from app.utils.base import abort, argument, response, routes, request
from app.utils.crud import GET, POST, DELETE, PUT
from app.utils.security import protected
from app.utils.base import session


@response(CollectionSchema2(many=True))
def get_all_collections():
    data = session.query(Collection).where(Collection.user_id == request.user.id).all()
    return data


@response(ChatSchema2(many=True))
def get_collection_chats(collection_id):
    has_permission = session.execute(
        select(1)
        .select_from(Collection)
        .where(Collection.user_id == request.user.id, Collection.id == collection_id)
    )
    if not has_permission:
        abort("No permission", 403)

    data = session.query(Chat).where(Chat.collection_id == collection_id).all()
    return data


@argument(CreateChatSchema())
@response(CollectionSchema2())
def add_collection(data):
    sources = data.get("sources", [])
    name = data.get("name")

    # name_exists = session.scalar(
    #     select(1)
    #     .select_from(Collection)
    #     .where(Collection.user_id == request.user.id, Collection.name == name)
    # )
    # if name_exists:
    #     abort("collection name already exists", 400)

    collection_id = uuid4()
    data = Collection(id=collection_id, name=name, user_id=request.user.id)

    session.add(data)

    def add_source(source_id: str):
        user_has_access = session.scalar(
            select(1)
            .select_from(Document)
            .where(Document.user_id == request.user.id, Document.id == source_id)
        )
        if not user_has_access:
            abort("no access to document", 403)
        source_obj = CollectionSource(document_id=source_id, collection_id=data.id)
        session.add(source_obj)

    for source_id in sources:  # type: ignore
        add_source(source_id)

    # create default chats (move this elsewhere)
    default_chats = [
        ("qa", "Question & Answer"),
        ("braindump", "Braindump"),
        ("quiz", "Quiz"),
    ]
    session.add_all(
        [
            Chat(
                name=chat,
                user_id=request.user.id,
                collection_id=collection_id,
                personality=personality,
            )
            for [personality, chat] in default_chats
        ]
    )

    try:
        session.commit()
    except Exception:
        session.rollback()

    return data


@response(chat_message_schema)
def delete_collection(collection_id):
    collection = session.get(Collection, collection_id)

    if collection is None:
        abort("collection does not exist", 400)
    if collection.user_id != request.user.id:
        abort("no permission", 403)

    session.delete(collection)
    session.commit()
    return {}


@response(CollectionSchema2())
def get_latest_collection():
    latest = (
        session.query(Collection)
        .join(Chat, Collection.id == Chat.collection_id)
        .where(Collection.user_id == request.user.id)
        .order_by(Chat.date_updated.desc())
        .limit(1)
        .one_or_none()
    )
    return latest


@argument(CollectionSchema(only=["name"]))
@response(CollectionSchema2())
def update_collection(collection: Collection, collection_id: str):
    collection_exists = session.scalar(
        select(1)
        .select_from(Collection)
        .where(Collection.user_id == request.user.id, Collection.id == collection_id)
    )
    if not collection_exists:
        abort("Collection not found", 404)

    session.query(Collection).filter_by(id=collection_id).update(
        {"name": collection.name}
    )
    session.commit()

    updated_collection = session.query(Collection).filter_by(id=collection_id).first()
    return updated_collection


collection_routes = routes(
    GET("/", get_all_collections),
    GET("/<uuid:collection_id>/chats", get_collection_chats),
    GET("/latest", get_latest_collection),
    PUT("/<uuid:collection_id>", update_collection),
    POST("/", add_collection),
    DELETE("/<uuid:collection_id>", delete_collection),
    decorators=[protected],
)
