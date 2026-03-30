import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.utils.base import AutoSchema, Base, Deleted, Resource
from app.models.user import User


# since relationships aren't coded into schema (no adjacency list etc) we have to be careful with
# server side validation to ensure no one can break the app
class Folder(Resource, Deleted, Base):
    path: Mapped[str] = mapped_column(sa.String(), nullable=False)

    user_id: Mapped[str] = mapped_column(sa.ForeignKey("user.id"), nullable=False)
    user: Mapped[User] = relationship("User", backref="folders")


FolderSchema = AutoSchema(Folder, foreign_keys=True)
