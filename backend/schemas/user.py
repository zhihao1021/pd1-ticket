from cryptography.fernet import Fernet
from pydantic import BaseModel

from hashlib import sha256

from config import KEY

class User(BaseModel):
    username: str
    password: str
    admin: bool

    def hash_value(self) -> str:
        hash_username = sha256(self.username.encode())
        return hash_username.hexdigest()[:32]
    
    def decrypted_password(self) -> str:
        encrypt = Fernet(KEY)
        return encrypt.decrypt(self.password).decode()
