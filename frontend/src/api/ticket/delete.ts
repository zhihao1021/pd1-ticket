import axios from "axios";

export default async function deleteTicket(ticket: string) {
    await axios.delete(`/ticket/${ticket}`);
}
