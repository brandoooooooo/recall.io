import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship, backref
from app.models.document import Document
from app.utils.base import AutoSchema, Base
from app.models.chat import Chat


class CollectionSource(Base):
    collection_id: Mapped[str] = mapped_column(
        sa.ForeignKey("collection.id"), nullable=False, primary_key=True
    )
    collection: Mapped[Chat] = relationship(
        "Collection", backref=backref("sources", cascade="all, delete-orphan")
    )

    document_id: Mapped[int] = mapped_column(
        sa.ForeignKey("document.id"), nullable=False, primary_key=True
    )
    document: Mapped[Document] = relationship(
        "Document", backref=backref("sources", cascade="all, delete-orphan")
    )

    date_created: Mapped[datetime.datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
    )


CollectionSourceSchema = AutoSchema(CollectionSource, foreign_keys=True)
