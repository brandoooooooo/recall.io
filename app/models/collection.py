import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.utils.base import AutoSchema, Base, Deleted, Resource
from app.models.user import User


class Collection(Resource, Deleted, Base):
    name: Mapped[str] = mapped_column(sa.String(), nullable=False)

    user_id: Mapped[str] = mapped_column(sa.ForeignKey("user.id"), nullable=False)
    user: Mapped[User] = relationship("User", backref="collections")


CollectionSchema = AutoSchema(Collection, foreign_keys=True)
