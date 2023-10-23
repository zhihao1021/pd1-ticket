from os import urandom

def gen_token():
    return urandom(16).hex()
