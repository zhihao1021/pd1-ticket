import axios from "axios";

export default async function getAnnouncement(): Promise<Array<string>> {
    const response = await axios.get("/announce");
    
    const data: {
        readonly: Array<string>
        data: Array<string>
    } = response.data;

    return data.readonly.concat(data.data);
}
