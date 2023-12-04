from asyncssh import connect, SFTPClient, SSHClientConnection, SSHClientConnectionOptions

from os.path import join
from time import time
from typing import Optional, Union

from config import DATA_DIR, SSH_ADDRESS
from schemas.user import User

class JudgeConnection:
    user: User
    ticket_id: str
    client: Optional[SSHClientConnection] = None
    sftp: Optional[SFTPClient] = None

    remote_dir_path: str = ""
    local_dir_path: str = ""
    def __init__(self, user: User, ticket_id: str) -> None:
        self.user = user
        self.ticket_id = ticket_id

    async def open(self):
        self.client = await get_ssh_session(
            username=self.user.username,
            password=self.user.decrypted_password()
        )
        self.sftp = await self.client.start_sftp_client()

        ticket_info = self.ticket_id.split("-", 2)[0][:4]
        timestamp  = int(time())
        remote_dir_path = f"pd1-ticket-temp/{ticket_info}_{timestamp}".replace(" ", "")
        if not await self.sftp.isdir(remote_dir_path):
            await self.sftp.makedirs(remote_dir_path)
        
        local_dir_path = join(DATA_DIR, self.ticket_id)

        self.remote_dir_path = remote_dir_path
        self.local_dir_path = local_dir_path

    async def upload(self, local_file: str, remote_file: str):
        local_path = join(self.local_dir_path, local_file)
        remote_path = f"{self.remote_dir_path}/{remote_file}"
        await self.sftp.put(local_path, remote_path)

    async def write(self, content: Union[bytes, str], remote_file: str, chdir: bool=True):
        if type(content) != bytes: content = content.encode()
        if chdir:
            async with self.sftp.open(f"{self.remote_dir_path}/{remote_file}", "wb") as file:
                await file.write(content)
        else:
            async with self.sftp.open(remote_file, "wb") as file:
                await file.write(content)

    async def read(self, remote_file: str, chdir: bool=True) -> bytes:
        result = b""
        if chdir:
            async with self.sftp.open(f"{self.remote_dir_path}/{remote_file}", "rb") as file:
                result = await file.read()
        else:
            async with self.sftp.open(remote_file, "rb") as file:
                result = await file.read()
        return result

    async def command(self, command: str, timeout: float, chdir: bool=True) -> tuple[str, str, Optional[int]]:
        if self.client is None:
            return
        if chdir: command = f"cd {self.remote_dir_path};" + command
        result = await self.client.run(
            command,
            timeout=timeout
        )
        return result.stdout, result.stderr, result.returncode

    def close(self):
        if self.client:
            self.client.close()

async def get_ssh_session(
    username: str,
    password: str,
) -> SSHClientConnection:
    host, port = SSH_ADDRESS.split(":")
    client = await connect(
        host=host,
        port=int(port),
        username=username,
        password=password,
        options=SSHClientConnectionOptions(
            public_key_auth=False
        )
    )
    return client