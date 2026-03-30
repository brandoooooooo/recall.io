from functools import wraps
from uuid import UUID
from flask import current_app
from sqlalchemy import select
from app.models.document import Document, DocumentSchema
from app.models.folder import Folder, FolderSchema
from app.rag.core import embed
from app.utils.base import abort, argument, response, routes, request
from app.utils.crud import GET, POST, DELETE, PUT
from app.utils.s3 import get_s3_file_size
from app.utils.security import protected
from app.utils.base import session
from app.models.temp import folder_schema

# move elsewhere later
create_file_schema = DocumentSchema(
    only=[
        "file_name",
        "object_key",
        "file_size",
        "content_type",
        "file_metadata",
        "folder_id",
    ]
)


@response(folder_schema)
def get_file_tree():
    data = session.query(Folder).where(Folder.user_id == request.user.id).all()
    return data


# messy
def extension(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return current_app.ensure_sync(func)(*args, **kwargs)

    return wrapper


@argument(create_file_schema)
@extension
async def create_document_in_folder(data: Document):
    data.user_id = request.user.id

    if len(data.file_name) > 50:
        abort("file name too large", 400)

    folder = session.get(Folder, data.folder_id)
    if folder is None or folder.user_id != request.user.id:
        abort("error", 403)

    if not data.content_type.startswith("text/"):
        abort("unsupported file type", 400)

    if get_s3_file_size(data.object_key) > 2 * 1024 * 1024:
        abort("file too large", 400)

    # TODO: potential security issue bc not guaranteed that object_key is owned by uploading user. not sure how to secure this yet
    session.add(data)
    session.flush()

    # do embedding
    try:
        print("embedding")
        await embed(data)
    except Exception as e:
        print("error embedding", e)
        abort("error", 500)

    session.commit()

    return {}


@argument(FolderSchema(only=["path"]))
@response(FolderSchema())
def create_folder(data: Folder):
    # TODO: do more path validation (ie that it's a contiguous path)
    data.user_id = request.user.id

    folder_exists = session.scalar(
        select(1)
        .select_from(Folder)
        .where((Folder.path == data.path) & (Folder.user_id == data.user_id))
    )

    if folder_exists:
        abort("folder exists", 400)

    # this assumes we dont store trailing /s in folder names (which is true rn but not an enforced invariant)
    is_contiguous = session.scalar(
        select(1)
        .select_from(Folder)
        .where(Folder.path == ("/".join(data.path.split("/")[:-1]) or "/"))
    )
    if not is_contiguous:
        abort("bad folder path", 400)

    last_folder = data.path.split("/").pop()
    if len(last_folder) == 0 or len(last_folder) > 50:
        abort("bad folder", 400)

    data.user_id = request.user.id

    session.add(data)
    session.commit()
    return data


@response(DocumentSchema(many=True))
def get_documents_by_folder_id(folder_id: UUID):
    # @Carter lmk if there are more fields you would want to return here

    folder = session.get(Folder, folder_id)
    if folder is None or folder.user_id != request.user.id:
        abort("Folder not found or access denied", 403)

    documents = session.query(Document).filter(Document.folder_id == folder_id).all()

    return documents


# Delete document & chat doc connection
@response(create_file_schema)
def delete_document(object_id: UUID):
    document = session.get(Document, object_id)

    if document is None or document.user_id != request.user.id:
        return abort("Document not", 403)

    # should be one, just did all to be safe
    # note chat messages are still preserved but all sources are gone after this
    # chat_sources = session.query(ChatSource).filter_by(document_id=object_id).all()
    # for chat_source in chat_sources:
    #     session.delete(chat_source)

    session.delete(document)
    session.commit()
    return {}


# Delete folder & documents & doc chat connections
@response(create_file_schema)
def delete_folder(object_id: UUID):
    folder = session.get(Folder, object_id)

    if folder is None or folder.user_id != request.user.id:
        return abort("Folder not", 403)

    subfolders = (
        session.query(Folder).filter(Folder.path.startswith(folder.path + "/")).all()
    )
    for subfolder in subfolders:
        session.delete(subfolder)

    session.delete(folder)

    session.commit()
    return {}


# Put / Rename the documents
@response(create_file_schema)
def update_document():
    data = request.get_json()
    document = session.get(Document, data.get("documentId"))

    if document is None or document.user_id != request.user.id:
        return abort("Document not", 403)

    new_name = data.get("newName")

    if len(new_name) > 50:
        abort("name too long", 400)

    document.file_name = new_name
    print(document.file_name)

    session.commit()
    return document


@response(create_file_schema)
def update_folder():
    data = request.get_json()
    folder = session.get(Folder, data.get("folderId"))

    if folder is None or folder.user_id != request.user.id:
        return abort("Folder not", 403)

    # Stores old path and creates new path
    old_path = folder.path.rstrip("/")
    new_name = data.get("newName")

    if len(new_name) > 50:
        abort("name too long", 400)

    path_parts = old_path.split("/")
    path_parts[-1] = new_name
    new_path = "/".join(path_parts)

    # Update the path for the main folder
    folder.path = new_path

    # finds ALL sub folders associated with previous old path
    subfolders = (
        session.query(Folder).filter(Folder.path.startswith(old_path + "/")).all()
    )
    for subfolder in subfolders:
        subfolder.path = new_path + subfolder.path[len(old_path) :]

    session.commit()
    return folder


file_routes = routes(
    GET("/all", get_file_tree),
    POST("/document", create_document_in_folder),
    POST("/folder", create_folder),
    DELETE("/<uuid:object_id>/document", delete_document),
    DELETE("/<uuid:object_id>/folder", delete_folder),
    GET("/<uuid:folder_id>/document", get_documents_by_folder_id),
    PUT("/rename-document", update_document),  # rename to /document/rename, etc
    PUT("/rename-folder", update_folder),
    decorators=[protected],
)
