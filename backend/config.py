from cryptography.fernet import Fernet

from os import makedirs, urandom
from os.path import isfile, isdir
from typing import Union

from orjson import dumps, loads, OPT_INDENT_2

EXAMPLE_CONFIG = {
    "host": "0.0.0.0",
    "port": 8080,
    "api_root_path": "",
    "data_dir": "data",
    "key": Fernet.generate_key(),
    "ssh_server": "140.116.246.48:22",
    "admin_token": urandom(16).hex()
}

if not isfile("config.json"):
    with open("config.json", "wb") as config_file:
        config_file.write(dumps(EXAMPLE_CONFIG, option=OPT_INDENT_2))

config: dict[str, Union[int, str]]
with open("config.json", "rb") as config_file:
    config = loads(config_file.read())

HOST: str = config.get("host", "0.0.0.0")
PORT: str = config.get("port", 8080)
API_ROOT_PATH: str = config.get("api_root_path", "")
DATA_DIR: str = config.get("data_dir", "data")
KEY = config["key"]
SSH_ADDRESS = config["ssh_server"]
ADMIN_TOKEN = config["admin_token"]

if not isdir(DATA_DIR):
    makedirs(DATA_DIR)
