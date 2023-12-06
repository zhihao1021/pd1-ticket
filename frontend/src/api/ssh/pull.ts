import axios from "axios";

export default async function pullFiles(fileArray: Array<string>): Promise<string> {
    const response = await axios.post(
        "/pull",
        {
            path_list: fileArray,
        },
    )

    return response.data;
}
