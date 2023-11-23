from os import listdir, remove, rmdir
from os.path import isdir, isfile, join, splitext

def rmtree(path: str):
    if isfile(path):
        remove(path)
    elif isdir(path):
        for file in listdir(path):
            rmtree(join(path, file))
        rmdir(path)

def similar_file(filename: str, dir_path: str) -> str:
    file_list = list(filter(lambda file: isfile(join(dir_path, file)), listdir(dir_path)))
    if filename in file_list: return filename

    _, ext = splitext(filename)
    def __score(file: str) -> int:
        result = -1 * abs(len(file) - len(filename))
        if file.endswith(ext):
            result += len(filename) ** 2 * 10
        for i in range(len(filename)):
            sub = filename[i:]
            if file.find(sub) != -1:
                result += (len(filename) - i) * 10
        return result

    file_list.sort(key=__score, reverse=True)
    return file_list[0]
