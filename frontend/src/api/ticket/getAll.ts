import axios from "axios";

export default async function getAllTickets(): Promise<Array<string>> {
    try {
        const response = await axios.get("/ticket");
        return response.data as Array<string>;
    }
    catch {return [];}
}
