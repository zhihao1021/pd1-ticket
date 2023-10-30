from pydantic import BaseModel

class Announcement(BaseModel):
    readonly: list[str] = []
    data: list[str] = []
