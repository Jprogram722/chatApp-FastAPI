# this file will contain the schemas for the api
from datetime import datetime
from pydantic import BaseModel

class UserSchema(BaseModel):
    id: int | None = None
    username: str
    password: str
    img_path: str | None = None

    class Config:
        from_attributes = True

class MessageSchema(BaseModel):
    id: int | None = None
    from_user: str | None = None
    message_content: str
    message_date: datetime | None = None