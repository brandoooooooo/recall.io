import argparse
import random
from typing import Any
from uuid import UUID, uuid4

from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app.models.collection_source import CollectionSource, CollectionSourceSchema
from app.models.collection import Collection, CollectionSchema
from app.models.document_index import DocumentIndex
from app.models.sts_token import StsToken
from app.utils.base import session
from app.models.user import User, UserSchema
from app.models.folder import Folder, FolderSchema
from app.models.document import Document, DocumentSchema
from app.models.chat import Chat, ChatSchema
from app.models.chat_message import ChatMessage, ChatMessageSchema


# TODO: scrub db with optional flag
USER_ID = "74781380-293e-4d4d-bef0-fa6d21fc912a"

# TODO: validate this
seeded_tree = {
    "/": [],
    "/COS333": ["README.md", "hello.txt"],
    "/COS333/Lecture1": ["Lecture 1 notes.txt"],
    "/COS333/Lecture2": ["Lecture 2 notes.txt"],
}

seed_collections = {
    "COS333": {
        "sources": [
            "Lecture 1 notes.txt",
            "Lecture 2 notes.txt",
        ],
        # boolean is True if from user
        "chats": {
            "cos333q&a": [
                ("What is the difference between python and java?", True),
                (
                    "Python has a concise, readable syntax that emphasizes code readability. It uses indentation to define code blocks, making it very beginner-friendly. Java syntax is more verbose and requires explicit use of braces {} for code blocks and semicolons ; at the end of statements, which can make it seem more complex, especially to beginners.",
                    False,
                ),
                ("What is the difference between client and server?", True),
                (
                    """
         The terms client and server describe roles in a network where devices communicate 
         to share resources and services. Here's a breakdown of their differences: Client: 
         Requests services or resources from the server. It initiates the interaction. Server: 
         Provides services or resources to the client. It responds to client requests.""",
                    False,
                ),
                ("Quiz me on python", True),
                (
                    """
        Which of the following is the correct way to define a function in Python? Options: A. func my_function():
        B. function my_function():
        C. def my_function():
        D. define my_function():""",
                    False,
                ),
            ],
            "cos333-testme": [
                ("Test me on my knowledge", True),
                ("no", False),
            ],
        },
    }
}

# seed_chats = {
#     "COS333 Lecture 1": [
#         ("What is the difference between python and java?", True),
#         (
#             "Python has a concise, readable syntax that emphasizes code readability. It uses indentation to define code blocks, making it very beginner-friendly. Java syntax is more verbose and requires explicit use of braces {} for code blocks and semicolons ; at the end of statements, which can make it seem more complex, especially to beginners.",
#             False,
#         ),
#     ],
#     "COS333 Lecture 2": [
#         ("What is the difference between client and server?", True),
#         (
#             """
#          The terms client and server describe roles in a network where devices communicate
#          to share resources and services. Here's a breakdown of their differences: Client:
#          Requests services or resources from the server. It initiates the interaction. Server:
#          Provides services or resources to the client. It responds to client requests.""",
#             False,
#         ),
#     ],
#     "COS333 Lecture 3": [
#         ("Quiz me on python", True),
#         (
#             """
#         Which of the following is the correct way to define a function in Python? Options: A. func my_function():
#         B. function my_function():
#         C. def my_function():
#         D. define my_function():""",
#             False,
#         ),
#     ],
# }


def drop_all_data():
    # will need to update manually
    session.query(ChatMessage).delete()
    session.query(Chat).delete()
    session.query(CollectionSource).delete()
    session.query(DocumentIndex).delete()
    session.query(Document).delete()
    session.query(Folder).delete()
    session.query(Collection).delete()
    session.query(StsToken).delete()
    session.query(User).delete()
    session.commit()


def generate_random_file_info(file_name: str, folder_id: UUID):
    CONTENT_TYPES = [
        "text/csv",
        "text/html",
        "image/jpeg",
        "video/mp4",
        "application/json",
    ]
    file_size = random.randint(0, 1024)
    content_type = CONTENT_TYPES[random.randrange(0, len(CONTENT_TYPES))]
    return {
        "file_name": file_name,
        "object_key": "fakekey",
        "file_size": file_size,
        "content_type": content_type,
        "folder_id": folder_id,
        "user_id": USER_ID,
    }


def generate_chat_message(
    chat_id: UUID, message: str, seq_num: int, from_user: bool = False
):
    return {
        "chat_id": chat_id,
        "sender": USER_ID if from_user else None,
        "message": message,
        "seq_num": seq_num,
    }


def seed(schema: SQLAlchemyAutoSchema, data: list[Any]):
    session.add_all(schema.load(data))


def seed_all(name: str, email: str):
    """Seed some initial data to make app dynamic/usable

    Note that this is a pretty constrained seed bc data being usable is inherently tied to which user you are logged in as
    (so we're just generating data for one user rn)
    """
    seed(UserSchema(many=True), [{"id": USER_ID, "email": email, "display_name": name}])
    # handle files/folders
    for folder, files in seeded_tree.items():
        folder_id = uuid4()
        seed(
            FolderSchema(many=True),
            [{"id": folder_id, "path": folder, "user_id": USER_ID}],
        )
        file_rows = list(
            map(
                lambda file_name: generate_random_file_info(file_name, folder_id),
                files,
            )
        )
        seed(DocumentSchema(many=True), file_rows)

    session.flush()

    # handle chats/chat messages
    for collection_name, collection in seed_collections.items():
        collection_id = uuid4()
        seed(
            CollectionSchema(many=True),
            [{"id": collection_id, "name": collection_name, "user_id": USER_ID}],
        )

        sources = collection.get("sources")
        chats = collection.get("chats")
        if not sources or not chats:
            raise Exception("invalid payload")

        for source in sources:
            document_id = (
                session.query(Document.id).where(Document.file_name == source).scalar()
            )
            seed(
                CollectionSourceSchema(many=True),
                [
                    {
                        "document_id": document_id,
                        "collection_id": collection_id,
                    }
                ],
            )

        for name, chat_messages in chats.items():
            chat_id = uuid4()
            seed(
                ChatSchema(many=True),
                [
                    {
                        "id": chat_id,
                        "name": name,
                        "next_seq_num": len(chat_messages) + 1,
                        "user_id": USER_ID,
                        "collection_id": collection_id,
                    }
                ],
            )
            chat_msg_rows = [
                generate_chat_message(chat_id, chat[0], idx + 1, chat[1])
                for idx, chat in enumerate(chat_messages)
            ]
            seed(ChatMessageSchema(many=True), chat_msg_rows)

    session.commit()


def construct_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="seed database tool",
    )

    parser.add_argument(
        "email",
        metavar="email",
        type=str,
        help="your email address (for the account you use on recall)",
    )

    parser.add_argument(
        "name",
        metavar="name",
        type=str,
        help="the name for the seeded user",
    )

    parser.add_argument(
        "--drop",
        action="store_true",
        help="drop all data in tables before seeding",
    )

    return parser


if __name__ == "__main__":
    parser = construct_parser()
    args = parser.parse_args()

    if args.drop:
        print("Dropping all data from tables...")
        drop_all_data()

    seed_all(args.name, args.email)
