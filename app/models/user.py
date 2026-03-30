import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column
from app.utils.base import AutoSchema, Base, Deleted, Resource


class User(Resource, Deleted, Base):
    display_name: Mapped[str] = mapped_column(sa.String, nullable=False)
    email: Mapped[str] = mapped_column(sa.String, nullable=False)
    accepted_aup: Mapped[Optional[datetime.datetime]] = mapped_column(
        sa.DateTime(timezone=True)
    )


UserSchema = AutoSchema(User)
user_schema = UserSchema(many=True)
