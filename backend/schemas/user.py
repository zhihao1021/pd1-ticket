from pydantic import BaseModel

from hashlib import sha256

class User(BaseModel):
    username: str
    password: str
    admin: bool

    def hash_value(self) -> str:
        hash_username = sha256(self.username.encode())
        return hash_username.hexdigest()[:32]
