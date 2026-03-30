from typing import Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship, backref
from app.utils.base import AutoSchema, Base, Resource
from app.models.chat import Chat


class ChatMessage(Resource, Base):
    chat_id: Mapped[str] = mapped_column(sa.ForeignKey("chat.id"), nullable=False)
    chat: Mapped[Chat] = relationship(
        "Chat",
        backref=backref(
            "chat_messages",
            order_by="ChatMessage.seq_num",
            cascade="all, delete-orphan",
        ),
    )

    sender: Mapped[Optional[str]] = mapped_column(
        sa.ForeignKey("user.id"), nullable=True
    )
    message: Mapped[str] = mapped_column(sa.String(), nullable=False)
    seq_num: Mapped[int] = mapped_column(sa.Integer(), nullable=False)


ChatMessageSchema = AutoSchema(ChatMessage, foreign_keys=True)
