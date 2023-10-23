import React from "react";

import "./index.scss";

type propsType = Readonly<{
    children?: Array<React.ReactElement>,
}>;

export default function TicketBlock(props: propsType): React.ReactElement {
    const {children} = props;
    const childrenLength = children ? children.length : 0;
    return (
        <div className="ticketBlock block">
            <h2>Tickets</h2>
            <div className="secBlock block">
                <div className="scrollBlock">
                    {childrenLength === 0 ?
                        <div className="emptyBox">
                            目前還沒有Ticket
                        </div> : children
                    }
                </div>
            </div>
        </div>
    );
}
