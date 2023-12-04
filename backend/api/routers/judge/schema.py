from pydantic import BaseModel

class JudgeResult(BaseModel):
    output: str = ""
    testcase_name: list[str] = ["Unavailable."]
    testcase: list[str] = ["Unavailable."]
    answer: list[str] = ["Unavailable."]
    user_output: list[str] = ["Unavailable."]
    dir_path: str = ""
