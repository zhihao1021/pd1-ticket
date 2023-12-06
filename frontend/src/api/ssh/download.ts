import axios from "axios";

export default async function downloadFiles(fileArray: Array<string>): Promise<Blob> {
    const response = await axios.post(
        "/pull/download",
        {
            path_list: fileArray,
        },
        {
            headers: { "Content-Type": "application/json; application/octet-stream" },
            responseType: "blob"
        }
    )

    return new Blob([response.data], { type: "application/zip" });
}
