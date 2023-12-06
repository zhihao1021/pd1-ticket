import axios from "axios";

export default async function editFile(filePath: string): Promise<string> {
    const response = await axios.postForm(
        "/pull/edit",
        {
            file_path: filePath
        }
    );

    return response.data
}
