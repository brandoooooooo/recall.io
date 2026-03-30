from datetime import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.utils.base import AutoSchema, Base, Deleted, Resource
from app.models.user import User


# table to store STS creds when valid
# deleted means the credential has been preemptively negated
class StsToken(Resource, Deleted, Base):
    access_key_id: Mapped[str] = mapped_column(sa.String(), nullable=False)
    secret_access_key: Mapped[str] = mapped_column(sa.String(), nullable=False)
    session_token: Mapped[str] = mapped_column(sa.String(), nullable=False)
    expiration: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False
    )

    user_id: Mapped[str] = mapped_column(sa.ForeignKey("user.id"), nullable=False)
    user: Mapped[User] = relationship("User", backref="creds")


StsTokenSchema = AutoSchema(StsToken, foreign_keys=True)
