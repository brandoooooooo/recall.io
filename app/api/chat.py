import os
from dotenv import load_dotenv

# from app.api.gpt import gpt_call
from sqlalchemy import select
from app.api.file import extension
from app.models.chat_message import ChatMessage, ChatMessageSchema
from app.models.chat import Chat, ChatSchema
from app.models.temp import chat_message_schema, ChatSchema2
from app.rag.core import query
from app.utils.base import abort, argument, response, routes, request
from app.utils.crud import GET, POST, DELETE
from app.utils.security import protected
from app.utils.base import session

load_dotenv()
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", None)


@response(ChatSchema(many=True))
def get_all_chats():
    data = session.query(Chat).where(Chat.user_id == request.user.id).all()
    return data


@response(chat_message_schema)
def get_all_chat_messages():
    data = session.query(Chat).where(Chat.user_id == request.user.id).all()
    return data


@argument(ChatSchema(only=["name", "collection_id"]))
@response(ChatSchema2())
def add_chat(chat: Chat):
    name_exists = session.scalar(
        select(1)
        .select_from(Chat)
        .where(Chat.user_id == request.user.id, Chat.name == chat.name)
    )
    if name_exists:
        abort("chat name already exists", 400)

    data = Chat(
        name=chat.name, user_id=request.user.id, collection_id=chat.collection_id
    )

    session.add(data)
    session.commit()
    return data


@argument(ChatMessageSchema(only=["chat_id", "message"]))
@extension
async def add_chat_message(data: ChatMessage):
    """Assume this is adding a chat message from the sending user only"""
    # check if user owns chat
    chat = session.get(Chat, data.chat_id)
    if not chat:
        abort("invalid chat id", 400)

    if not data.message or data.message == "":
        abort("invalid message", 400)

    data.sender = request.user.id
    data.seq_num = chat.next_seq_num

    chat.next_seq_num += 1

    session.add(data)

    # committing gpt response
    response = ChatMessage()
    response.chat_id = data.chat_id
    response.seq_num = chat.next_seq_num
    response.sender = None
    # temporary
    if OPENAI_API_KEY:
        response.message = await query(data.message, chat)  # type: ignore
    else:
        response.message = "AI response to " + data.message

    if response.message is None or response.message == "":
        session.rollback()
        abort("error with messages", 500)

    chat.next_seq_num += 1

    session.add(response)
    session.add(chat)

    try:
        session.commit()
    except Exception:
        session.rollback()

    return {}


@response(chat_message_schema)
def delete_chat_and_messages(object_id):  # where object_id is chat id
    print(object_id)
    chat = session.get(Chat, object_id)

    if chat is None or chat.user_id != request.user.id:
        return abort("Chat not", 403)

    session.delete(chat)
    session.commit()
    return {}


chat_routes = routes(
    GET("/", get_all_chats),
    POST("/", add_chat),
    POST("/message", add_chat_message),
    GET("/message", get_all_chat_messages),
    DELETE("/<uuid:object_id>", delete_chat_and_messages),
    decorators=[protected],
)
