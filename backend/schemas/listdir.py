from pydantic import BaseModel

class ListDir(BaseModel):
    path: str
    directory: list[str]
    files: list[str]
