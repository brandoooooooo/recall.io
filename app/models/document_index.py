import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship, backref
from app.utils.base import AutoSchema, Base, Deleted, Resource
from pgvector.sqlalchemy import Vector
from marshmallow import ValidationError, fields

from app.models.document import Document


# plan to use text-embedding-3-small (vector size 1536) for now
VECTOR_SIZE = 1536


class VectorField(fields.Field):
    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return []
        return list(value)

    def _deserialize(self, value, attr, data, **kwargs):
        if not isinstance(value, list):
            raise ValidationError("Invalid input type. Expected a list.")
        return [float(x) for x in value]


# TODO: improve this schema when indexing method is decided upon
class DocumentIndex(Resource, Deleted, Base):
    document_id: Mapped[int] = mapped_column(
        sa.ForeignKey("document.id"), nullable=False
    )
    document: Mapped[Document] = relationship(
        "Document", backref=backref("indexes", cascade="all, delete-orphan")
    )

    text: Mapped[str] = mapped_column(sa.String, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(VECTOR_SIZE))
    position: Mapped[int] = mapped_column(sa.Integer, nullable=False)


class DocumentIndexSchema(AutoSchema(DocumentIndex, excluded=["embedding"])):
    embedding = VectorField()
