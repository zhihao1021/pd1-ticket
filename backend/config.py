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
    "admin_token": urandom(16).hex(),
    "admins": [],
    "judge_commands": []
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
ADMINS: list[str] = config.get("admins", [])
JUDGE_COMMANDS: list[str] = config.get("judge_commands", [])

if not isdir(DATA_DIR):
    makedirs(DATA_DIR)
if not isdir("logs"):
    makedirs("logs")
if not isfile("announcement.json"):
    with open("announcement.json", "wb") as announce_file:
        announce_file.write(dumps({
            "readonly": [
                "請不要嘗試攻擊網站。\nPlease do not try to attack the website.",
                "原則上不限制上傳檔案數，單個檔案上限32KB。\nThere is no limit with file num, but maximum 32 KB per file.",
                "上傳的檔案在下個禮拜四前皆只有你自己與助教可以存取，可以安心將連結傳至公共頻道。\nThe file you uploaded can only be access by you and TA before next thursday. Therefore, you can send the link to public channel safely.",
                "若有任何問題請在Discord私訊我: zhihao1021。\nIf there are any problems or bugs, DM me on discord: zhihao1021(nickname: YEE)."
            ],
            "data": [],
        }, option=OPT_INDENT_2))
