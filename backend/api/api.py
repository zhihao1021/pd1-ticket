from asyncio import BaseEventLoop

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import Config, Server

from config import API_ROOT_PATH, HOST, PORT

from .routers import ticket_router

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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ticket_router)

async def api_run(loop: BaseEventLoop):
    config = Config(
        app=app,
        host=HOST,
        port=PORT,
        loop=loop,
    )
    server = Server(config)
    await server.serve()
