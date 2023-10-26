from asyncio import run

import asyncssh

async def main():
    conn = None
    try:
        conn = await asyncssh.connect(
            host="140.116.246.48",
            port=22,
            username="F74124773",
            password="F74124773",
        )
        sftp = await conn.start_sftp_client()
        print(await sftp.isdir(""))
        # if not await sftp.isdir("HW8/123"):
        #     await sftp.makedirs("HW8/123")
        # await sftp.put("main.py", "HW8/123/main.py")
        sftp.exit()
        await sftp.wait_closed()
    except Exception as e:
        print(e)
    finally:
        if conn:
            conn.close()

run(main=main())
