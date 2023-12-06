import axios from "axios";

export default async function addTicket(files: Array<File> | FileList): Promise<string> {
    const filesArray = Array.from(files);
    const formData = new FormData();
    filesArray.forEach(file => formData.append("files", file));

    const response = await axios.postForm("/ticket", formData);

    return response.data as string;
}
