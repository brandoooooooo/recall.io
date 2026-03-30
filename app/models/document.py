from typing import Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship, backref
from app.utils.base import AutoSchema, Base, Deleted, Resource
from app.models.user import User
from app.models.folder import Folder


# assume static S3 bucket for now
class Document(Resource, Deleted, Base):
    file_name: Mapped[str] = mapped_column(sa.String, nullable=False)
    object_key: Mapped[str] = mapped_column(sa.String, nullable=False)
    file_size: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    content_type: Mapped[str] = mapped_column(sa.String, nullable=False)
    file_metadata: Mapped[Optional[dict]] = mapped_column(sa.JSON, nullable=True)

    folder_id: Mapped[str] = mapped_column(sa.ForeignKey("folder.id"), nullable=False)
    folder: Mapped[Folder] = relationship(
        "Folder", backref=backref("documents", cascade="all, delete-orphan")
    )

    user_id: Mapped[str] = mapped_column(sa.ForeignKey("user.id"), nullable=False)
    user: Mapped[User] = relationship(
        "User", backref=backref("documents", cascade="all, delete-orphan")
    )


DocumentSchema = AutoSchema(Document, foreign_keys=True)
document_schema = DocumentSchema(many=True)
