from asyncio import run

import asyncssh

async def main():
    conn = None
    try:
        conn = await asyncssh.connect(
            host="140.116.246.48",
            port=22,
            username="F74124773",
            password="F74124773"
        )
        sftp = await conn.start_sftp_client()
        print((await conn.run("ls")).stdout)
        print((await conn.run("mkdir HW8")).stdout)
        await sftp.mkdir("HW8")
        await sftp.wait_closed()
    except:
        pass
    finally:
        if conn:
            conn.close()

run(main=main())
