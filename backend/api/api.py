from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import Config, Server
from uvicorn.config import LOGGING_CONFIG

from asyncio import BaseEventLoop
from copy import deepcopy
from datetime import datetime

from config import API_ROOT_PATH, HOST, PORT

from .routers import (
    announce_router,
    judge_router,
    ticket_router,
    pull_router,
    oauth_router,
    upload_router,
    special_judge_router
)

app = FastAPI(
    version="0.1.0",
    root_path=API_ROOT_PATH,
)

origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(announce_router)
app.include_router(judge_router)
app.include_router(oauth_router)
app.include_router(pull_router)
app.include_router(ticket_router)
app.include_router(upload_router)
app.include_router(special_judge_router)

async def api_run(loop: BaseEventLoop):
    logging_file_name = datetime.now().strftime("logs/%Y-%m-%d %H_%M_%S.log")
    logging_config = deepcopy(LOGGING_CONFIG)
    formatters_config = {
        "default_nocolor": {
            "()": "uvicorn.logging.DefaultFormatter",
            "fmt": "%(levelprefix)s [%(asctime)s] %(message)s",
            "use_colors": False,
        },
        "access_nocolor": {
            "()": "uvicorn.logging.AccessFormatter",
            "fmt": '%(levelprefix)s [%(asctime)s] %(client_addr)s - "%(request_line)s" %(status_code)s',
            "use_colors": False,
        }
    }
    handlers_config = {
        "default_file": {
            "formatter": "default_nocolor",
            "class": "logging.FileHandler",
            "filename": logging_file_name,
            "encoding": "utf-8"
        },
        "access_file": {
            "formatter": "access_nocolor",
            "class": "logging.FileHandler",
            "filename": logging_file_name,
            "encoding": "utf-8"
        }
    }
    logging_config["formatters"].update(formatters_config)
    logging_config["formatters"]["default"]["fmt"] = "%(levelprefix)s [%(asctime)s] %(message)s"
    logging_config["formatters"]["access"]["fmt"] = '%(levelprefix)s [%(asctime)s] %(client_addr)s - "%(request_line)s" %(status_code)s'
    logging_config["handlers"].update(handlers_config)
    logging_config["loggers"]["uvicorn"]["handlers"].append("default_file")
    logging_config["loggers"]["uvicorn.access"]["handlers"].append("access_file")

    config = Config(
        app=app,
        host=HOST,
        port=PORT,
        loop=loop,
        log_config=logging_config
    )
    server = Server(config)
    await server.serve()
