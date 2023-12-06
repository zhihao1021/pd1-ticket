import axios from "axios";

export default async function getJudgeList(): Promise<Array<string>> {
    const response = await axios.get("/judge")

    return response.data;
}
