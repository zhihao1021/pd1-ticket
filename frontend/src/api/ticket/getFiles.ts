import axios from "axios";

const cacheData: {[key: string]: Array<string>} = {};

export default async function getTicketFiles(ticket: string): Promise<Array<string>> {
    const cache = cacheData[ticket];
    if (cache) return cache;
    const response = await axios.get(`/ticket/${ticket}`);
    cacheData[ticket] = response.data;
    return response.data as Array<string>;
}
