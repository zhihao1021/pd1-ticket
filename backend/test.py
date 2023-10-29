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
        print(int((await conn.run("echo $UID")).stdout))
        sftp = await conn.start_sftp_client()
        # print(await sftp.realpath("HW6/../HW6/hw6.c"))
        res = await sftp.readdir("/")
        for i in res:
            print(bool(i.attrs.permissions & 0b100 or i.attrs.uid==1178), i.attrs.type, i.filename)
        # sftp.exit()
        # await sftp.wait_closed()
    except Exception as e:
        print("EXC:", e)
        print("EXC Class:", e.__class__)
    finally:
        if conn:
            conn.close()

run(main=main())
