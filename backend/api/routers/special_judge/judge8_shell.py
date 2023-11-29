from fastapi import APIRouter

from .generate.judge8 import generate
from .judge8_1 import MAIN_CODE as J8_1_MAIN_CODE
from .judge8_2 import MAIN_CODE as J8_2_MAIN_CODE

router = APIRouter(
    prefix="/judge8-shell",
    tags=["Judge8"]
)

@router.get("/8-1")
def get_shell():
    testcase, answer = generate()
    
    result = [
        "RED=\"\033[0;31m\";",
        "GREEN=\"\033[0;32m\";",
        "YELLOW=\"\033[0;33m\";",
        "MAGENTA=\"\033[0;35m\";",
        "CYAN=\"\033[0;36m\";",
        "WHITE=\"\033[0;37m\";",
        "GRAY=\"\033[0;90m\";",
        "NC=\"\033[0m\";",
        f"echo \"{J8_1_MAIN_CODE}\" > main1.c;",
        f"echo \"{testcase}\" > testcase.in;",
        f"echo \"{answer}\" > answer;",
        "gcc -o hw8-1 hw8-1.c main1.c",
        "if (( $? != 0 )); then",
            "echo -e \"Result: ${YELLOW}Compilation Error${NC}\";",
        "else",
        "   timeout 1 bash -c \"./hw8-1 < testcase.in > your_answer;\";",
        "   RETURN_CODE=$?;",
        "   if (( $RETURN_CODE == 0 )); then",
        "       diff your_answer answer >> /dev/null;",
        "       if (( $? != 0 )); then",
        "           echo -e \"Result: ${RED}Wrong Answer${NC}\";",
        "           echo -e \"${YELLOW}Note: You can use the following command to compare your code's output with answer :${NC}\ndiff your_answer answer",
        "       else",
        "           echo -e \"Result: ${GREEN}Answer Correct${NC}\";",
        "       fi",
        "   else",
        "       if (( $RETURN_CODE == 124 )); then",
        "           echo -e \"Result: ${CYAN}Time Limit Exceed${NC}\";",
        "       else",
        "           echo -e \"${CYAN}Runtime Error, Return ${RETURN_CODE}${NC}\"",
        "       fi",
        "   fi",
        "fi",
    ]

    return "\n".join(result)

@router.get("/8-2")
def get_shell():
    testcase, answer = generate()
    
    result = [
        "RED=\"\033[0;31m\";",
        "GREEN=\"\033[0;32m\";",
        "YELLOW=\"\033[0;33m\";",
        "MAGENTA=\"\033[0;35m\";",
        "CYAN=\"\033[0;36m\";",
        "WHITE=\"\033[0;37m\";",
        "GRAY=\"\033[0;90m\";",
        "NC=\"\033[0m\";",
        f"echo \"{J8_2_MAIN_CODE}\" > main2.c;",
        f"echo \"{testcase}\" > testcase.in;",
        f"echo \"{answer}\" > answer;",
        "gcc -o hw8-2 hw8-2.c main2.c",
        "if (( $? != 0 )); then",
            "echo -e \"Result: ${YELLOW}Compilation Error${NC}\";",
        "else",
        "   timeout 1 bash -c \"./hw8-2 < testcase.in > your_answer;\";",
        "   RETURN_CODE=$?;",
        "   if (( $RETURN_CODE == 0 )); then",
        "       diff your_answer answer >> /dev/null;",
        "       if (( $? != 0 )); then",
        "           echo -e \"Result: ${RED}Wrong Answer${NC}\";",
        "           echo -e \"${YELLOW}Note: You can use the following command to compare your code's output with answer :${NC}\ndiff your_answer answer",
        "       else",
        "           echo -e \"Result: ${GREEN}Answer Correct${NC}\";",
        "       fi",
        "   else",
        "       if (( $RETURN_CODE == 124 )); then",
        "           echo -e \"Result: ${CYAN}Time Limit Exceed${NC}\";",
        "       else",
        "           echo -e \"${CYAN}Runtime Error, Return ${RETURN_CODE}${NC}\"",
        "       fi",
        "   fi",
        "fi",
    ]

    return "\n".join(result)
