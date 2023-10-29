import React from "react";

import { apiEndPoint } from "../../config";

import "./index.scss";

type propsType = Readonly<{
    deleteTicket: (ticketId: string) => void,
    ticketId: string
}>;

export default function TicketBox(props: propsType): React.ReactElement {
    const {
        deleteTicket,
        ticketId
    } = props;
    const newDeleteTicket = () => {
        deleteTicket(ticketId);
    };
    const token = localStorage.getItem("access_token");
    return (
        <div className="ticketBox">
            <a className="name" href={`#${ticketId}`}>{ticketId}</a>
            <div className="delete" onClick={newDeleteTicket} >Delete</div>
            <a className="download" href={`${apiEndPoint}/ticket/download/${ticketId}?token=${token}`} >Download</a>
        </div>
    );
}
