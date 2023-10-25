from asyncio import run

import asyncssh

async def main():
    conn = None
    try:
        conn = await asyncssh.connect(
            host="140.116.246.48",
            port=22,
            username="F74124773123",
            password="F74124773"
        )
        result = await conn.run("ls", timeout=1)
        print(result.stdout)
    except:
        pass
    finally:
        if conn:
            conn.close()
            conn.close()

run(main=main())
