from hashlib import sha256

from config import ADMIN_TOKEN

def hash_token(token: str, ip: str):
    if token == ADMIN_TOKEN:
        return token
    sha = sha256(token.encode())
    # sha.update(ip.encode())
    hash_text = sha.hexdigest()
    return hash_text[:32]
