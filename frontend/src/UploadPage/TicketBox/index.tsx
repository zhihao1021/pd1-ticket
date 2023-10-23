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
    return (
        <div className="ticketBox">
            <a className="name" href={`#${ticketId}`}>{ticketId}</a>
            <div className="delete" onClick={newDeleteTicket} >Delete</div>
            <a className="download" href={`${apiEndPoint}/ticket/${ticketId}`}>Download</a>
        </div>
    );
}
