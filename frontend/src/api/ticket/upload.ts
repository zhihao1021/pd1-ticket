import axios from "axios";

export default async function uploadTicket(ticket: string, directory?: string, formatCode?: boolean): Promise<string> {
    const response = await axios.postForm(`/upload`, {
        ticket_id: ticket,
        remote_dir: directory ?? "",
        format_code: formatCode ?? false,
    });

    return response.data;
}
