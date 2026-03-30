from app.models.chat import Chat
from app.rag.index import insert_document
from app.utils.base import request
from app.models.document import Document
from app.utils.s3 import get_s3_file
from app.rag.query import chat_query


async def embed(document: Document):
    """Given a document, chunk the document, compute its embeddings, and store in DocumentIndex

    For now this is a end-to-end method, but we can separate functionality later. By e2e, I mean it pulls
    the file from S3

    Consider floating permission check up
    """
    # permission check
    has_permission = document.user.id == request.user.id
    if not has_permission:
        raise Exception("invalid permission")

    try:
        raw_file_content = get_s3_file(document.object_key)
        content = raw_file_content.decode("utf-8", errors="replace").replace("\x00", "")

        # print("got content", content)
        await insert_document(content, document.id)
    except Exception as e:
        print("error here", e)
        raise Exception("error generating embeddings") from e


async def query(user_query: str, chat: Chat):
    return await chat_query(user_query, chat)
