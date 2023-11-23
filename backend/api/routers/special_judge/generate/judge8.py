from random import randint, choice
from typing import Union

def char_conv(inp: Union[str, list[int]]) -> Union[str, list[int]]:
    if type(inp) == str:
        return list(map(lambda c: ord(c) - 65, inp))
    return "".join(map(lambda c: chr(c), inp))

def random_str() -> str:
    return "".join(map(lambda _: chr(randint(ord("A"), ord("Z"))), range(3)))

def generate() -> tuple[str, str]:
    array: list[list[list[int]]] = []
    for _ in range(26):
        array.append([])
        for _ in range(26):
            array[-1].append([1] * 26)
    
    testcase: list[str] = []
    answer: list[str] = []
    modifyed: set[str] = set()

    for _ in range(1000):
        if randint(0, 1):
            gen_string = random_str()
            x, y, z = char_conv(gen_string)

            value = randint(-10000, 10000) if randint(0, 5) else 0

            modifyed.add(gen_string)
            array[x][y][z] = value

            testcase.append(f"1\n{gen_string} {value}")
        else:
            str1: str
            str2: str
            if len(modifyed) == 0:
                str1, str2 = random_str(), random_str()
            else:
                str1 = choice(tuple(modifyed)) if randint(0, 3) else random_str()
                str2 = choice(tuple(modifyed - {str1})) if randint(0, 3) and len(modifyed) > 2 else random_str()
            x1, y1, z1 = char_conv(str1)
            x2, y2, z2 = char_conv(str2)

            value1 = array[x1][y1][z1]
            value2 = array[x2][y2][z2]

            result = "YES" if (value1 + value2) % 2 else "NO"

            testcase.append(f"2\n{str1} {str2}")
            answer.append(result)
    return "\n".join(testcase), "\n".join(answer) + "\n"
