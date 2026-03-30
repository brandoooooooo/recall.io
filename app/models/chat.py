import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship, backref
from app.models.collection import Collection
from app.utils.base import AutoSchema, Base, Deleted, Resource
from app.models.user import User


class Chat(Resource, Deleted, Base):
    name: Mapped[str] = mapped_column(sa.String(), nullable=False)

    collection_id: Mapped[str] = mapped_column(sa.ForeignKey("collection.id"))
    collection: Mapped[Collection] = relationship(
        "Collection", backref=backref("chats", cascade="all, delete-orphan")
    )

    personality: Mapped[str] = mapped_column(sa.String(), nullable=True)

    user_id: Mapped[str] = mapped_column(sa.ForeignKey("user.id"), nullable=False)
    user: Mapped[User] = relationship("User", backref="chats")

    next_seq_num: Mapped[int] = mapped_column(sa.Integer(), default=0, nullable=False)


ChatSchema = AutoSchema(Chat, foreign_keys=True)
