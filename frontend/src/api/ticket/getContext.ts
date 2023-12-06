import axios from "axios";

const cacheData: {[key: string]: string} = {};

export default async function getFileContext(ticket: string, filename: string): Promise<string> {
    const cache = cacheData[`${ticket}/${filename}`];
    if (cache) return cache;
    const response = await axios.get(`/ticket/${ticket}/${filename}`);
    cacheData[`${ticket}/${filename}`] = response.data;
    return response.data as string;
}
