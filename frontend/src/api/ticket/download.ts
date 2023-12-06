import axios from "axios";

export default async function downloadTicket(ticket: string): Promise<Blob> {
    const response = await axios.get(`/ticket/${ticket}?download=true`, {
        headers: { "Content-Type": "application/json; application/octet-stream" },
        responseType: "blob"
    });

    return new Blob([response.data], {type:"application/zip"});
}
