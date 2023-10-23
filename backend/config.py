from os import makedirs
from os.path import isfile, isdir
from typing import Dict, Union

from orjson import dumps, loads, OPT_INDENT_2

from utils.gen_token import gen_token

EXAMPLE_CONFIG = {
    "host": "0.0.0.0",
    "port": 8080,
    "api_root_path": "",
    "data_dir": "data",
    "admin_token": gen_token()
}

if not isfile("config.json"):
    with open("config.json", "wb") as config_file:
        config_file.write(dumps(EXAMPLE_CONFIG, option=OPT_INDENT_2))

config: Dict[str, Union[int, str]]
with open("config.json", "rb") as config_file:
    config = loads(config_file.read())

HOST: str = config.get("host", "0.0.0.0")
PORT: str = config.get("port", 8080)
API_ROOT_PATH: str = config.get("api_root_path", "")
DATA_DIR: str = config.get("data_dir", "data")
ADMIN_TOKEN = config["admin_token"]

if not isdir(DATA_DIR):
    makedirs(DATA_DIR)
