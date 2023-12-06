interface JudgeResult {
    readonly output: string
    readonly testcase_name: Array<string>,
    readonly testcase: Array<string>,
    readonly answer: Array<string>,
    readonly user_output: Array<string>,
    readonly dir_path: string,
}

export default JudgeResult
