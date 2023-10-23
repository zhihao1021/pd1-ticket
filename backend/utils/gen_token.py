from hashlib import sha256
from os import urandom

from config import ADMIN_TOKEN

def gen_token():
    return urandom(16).hex()

def hash_token(token: str, ip: str):
    if token == ADMIN_TOKEN:
        return token
    sha = sha256(token.encode())
    sha.update(ip.encode())
    hash_text = sha.hexdigest()
    return hash_text[:32]
