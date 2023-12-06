import axios from "axios";

export default async function uploadFiles(files: Array<File> | FileList, remotePath: string): Promise<string> {
    const filesArray = Array.from(files);
    const formData = new FormData();
    formData.append("remote_path", remotePath);
    filesArray.forEach(file => formData.append("files", file));

    const response = await axios.postForm("/pull/upload", formData);

    return response.data;
}
