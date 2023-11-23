from pydantic import BaseModel

class SpecialJudge(BaseModel):
    error: bool = False
    diff: str = ""
    stderr: str = ""
    testcase: str = ""
    answer: str = ""
    user_output: str = ""
