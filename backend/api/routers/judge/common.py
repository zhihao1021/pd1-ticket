from asyncssh import PermissionDenied

from schemas.user import User
from utils import JudgeConnection, similar_file

from ...exceptions import (
    AUTHORIZE_FAIL,
    UNKNOW_ERROR,
)

from .schema import JudgeResult

async def commom_judge(
    user: User,
    ticket_id: str,
    command: str,
    upload_files: list[str],
    testcase_name: list[str],
    testcase: list[str],
    answer: list[str],
    user_output: list[str],
) -> JudgeResult:
    judge: JudgeConnection = JudgeConnection(
        user=user,
        ticket_id=ticket_id
    )
    try:
        await judge.open()

        for filename in upload_files:
            local_file = similar_file(filename, judge.local_dir_path)
            await judge.upload(
                local_file=local_file,
                remote_file=filename
            )

        stdout, stderr, _ = await judge.command(
            command=f"{command} -p {judge.remote_dir_path}",
            timeout=15,
            chdir=False
        )

        testcase_result = []
        for testcase_path in testcase:
            try:
                context = await judge.read(testcase_path)
                testcase_result.append(context.decode())
            except:
                testcase_result.append("Unavailable.")

        answer_result = []
        for answer_path in answer:
            try:
                context = await judge.read(answer_path)
                answer_result.append(context.decode())
            except:
                answer_result.append("Unavailable.")

        user_output_result = []
        for user_output_path in user_output:
            try:
                context = await judge.read(user_output_path)
                user_output_result.append(context.decode())
            except:
                user_output_result.append("Unavailable.")

        return JudgeResult(
            output=stdout or stderr,
            testcase_name=testcase_name,
            testcase=testcase_result,
            answer=answer_result,
            user_output=user_output_result,
            dir_path=judge.remote_dir_path
        )
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except TimeoutError:
        return JudgeResult(output="Judge Timeout.")
    except:
        raise UNKNOW_ERROR
    finally:
        judge.close()