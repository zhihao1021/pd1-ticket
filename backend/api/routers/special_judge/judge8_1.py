from asyncssh import PermissionDenied
from fastapi import APIRouter, status

from schemas.user import User
from utils import similar_file, JudgeConnection

from .response import SpecialJudge
from .generate.judge8 import generate
from ...exceptions import AUTHORIZE_FAIL
from ...depends import user_depends, ticket_depends

MAIN_CODE = r"""
#include <stdio.h>
#include <stdlib.h>
#include "hw8-1.h"

int main()
{
    int*** mp;
    mp = (int***)malloc( 130 * sizeof(int**) );
    init(mp);

    int q = 1000;
    while(q--)
    {
        int opt;
        scanf("%d",&opt);
        if( opt == 1 )
        {
            char str[4] = {};
            int val;

            scanf("%s %d",str,&val);

            int* pos = &(mp[str[0]][str[1]][str[2]]);
            modify(pos,val);
        }
        else
        {
            char a[4],b[4];
            scanf("%s %s",a,b);
            int check = query(&mp,a,b);

            printf( ( check == 1 ? "YES\n" : "NO\n" )  );
        }
    }

    return 0;
}
"""

router = APIRouter(
    prefix="/judge8-1",
    tags=["Judge8"]
)

@router.get(
    path="/{ticket_id}",
    status_code=status.HTTP_200_OK
)
async def get_judge_result(
    user: User=user_depends,
    ticket_id: str=ticket_depends,
) -> SpecialJudge:
    judge: JudgeConnection = JudgeConnection(
        user=user,
        ticket_id=ticket_id
    )
    try:
        await judge.open()

        # 傳送檔案
        local_file = similar_file("hw8-1.c", judge.local_dir_path)
        await judge.upload(
            local_file=local_file,
            remote_file="hw8-1.c"
        )
        local_file = similar_file("hw8-1.h", judge.local_dir_path)
        await judge.upload(
            local_file=local_file,
            remote_file="hw8-1.h"
        )

        # 題目檔案
        await judge.write(MAIN_CODE, "main.c")

        stdout, stderr, return_code = await judge.command(
            "gcc main.c hw8-1.c -o hw8-1",
            timeout=5,
            chdir=True
        )
        if return_code != 0:
            return SpecialJudge(
                error=True,
                stderr=stderr or stdout or "No Error Message"
            )
        
        # 傳送測資
        testcase, answer = generate()
        await judge.write(testcase, "testcase.in")
        await judge.write(answer, "testcase.out")
        
        stdout, stderr, return_code = await judge.command(
            "./hw8-1 < testcase.in > your_answer.out",
            timeout=3,
            chdir=True
        )
        if return_code != 0:
            return SpecialJudge(
                error=True,
                stderr=stderr or stdout or "No Error Message"
            )
        
        stdout, _, _ = await judge.command(
            "diff testcase.out your_answer.out",
            timeout=3,
            chdir=True
        )
        if stdout == "": stdout = "Answer Correct"
        return SpecialJudge(
            diff=stdout,
            testcase=testcase,
            answer=answer,
            user_output=(await judge.read("your_answer.out")).decode()
        )
    except PermissionDenied:
        raise AUTHORIZE_FAIL
    except TimeoutError:
        return "Judge Timeout."
    # except:
    #     raise UNKNOW_ERROR
    finally:
        judge.close()
