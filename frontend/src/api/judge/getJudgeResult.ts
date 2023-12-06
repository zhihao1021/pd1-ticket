import axios from "axios";

import JudgeResult from "../../schemas/judgeResult";

export default async function getJudgeResult(ticket: string, command: string): Promise<JudgeResult> {
    const response = await axios.get(`/judge/${ticket}?command=${command}`)

    return response.data as JudgeResult;
}
