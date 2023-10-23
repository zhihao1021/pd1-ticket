from asyncio import new_event_loop, run

from api import api_run

if __name__ == "__main__":
    loop = new_event_loop()

    run(api_run(loop))
