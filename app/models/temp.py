from marshmallow import fields, EXCLUDE, Schema
from app.models.chat_message import ChatMessageSchema
from app.models.collection import Collection
from app.models.collection_source import CollectionSourceSchema
from app.models.document import DocumentSchema
from app.utils.base import AutoSchema
from app.models.chat import Chat
from app.models.folder import Folder

# TODO: will probably move all schemas somewhere else, this for now tho


class ChatSchema2(AutoSchema(Chat, foreign_keys=True)):
    chat_messages = fields.Nested(
        ChatMessageSchema(many=True), unknown=EXCLUDE, allow_none=True
    )


class CollectionSchema2(AutoSchema(Collection, foreign_keys=True)):
    sources = fields.Pluck(CollectionSourceSchema, "document_id", many=True)


chat_message_schema = ChatSchema2(only=["id", "chat_messages"], many=True)


class CreateChatSchema(Schema):
    name = fields.String()
    sources = fields.List(fields.UUID())


class FolderSchema2(AutoSchema(Folder, foreign_keys=True)):
    documents = fields.Nested(
        DocumentSchema(many=True), unknown=EXCLUDE, allow_none=True
    )


folder_schema = FolderSchema2(many=True)
