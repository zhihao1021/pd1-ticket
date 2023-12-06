import { TicketPageState } from "../../states";

import { Block, PopupBox } from "../../ui";

import { changeShowTicket, switchPage } from "../../publicFunction";

import "./index.scss"

export default class TicketPage extends TicketPageState {
    render(): React.ReactNode {
        const {
            show
        } = this.props;
        const {
            ticketArray,
            popupShow,
            popupMessage,
            popupOK,
            popupCancel
        } = this.state;

        const sortedTicketArray = ticketArray.sort((data1, data2) => {
            const v1 = parseInt(data1.datetime.replaceAll("_", "").replaceAll(".", "").replace("T", ""));
            const v2 = parseInt(data2.datetime.replaceAll("_", "").replaceAll(".", "").replace("T", ""));
            return v2 - v1;
        });

        return (
            <div id="ticket" className="page" data-show={show}>
                <PopupBox
                    show={popupShow}
                    message={popupMessage}
                    ok={popupOK}
                    cancel={popupCancel}
                    close={() => {
                        this.setState({
                            popupShow: false,
                            popupOK: undefined,
                            popupCancel: undefined,
                        })
                    }}
                />
                <Block title="Ticket">
                    <div className="content">
                        {sortedTicketArray.map((data, index) => (
                            <div className="box" key={index}>
                                <span
                                    className="ticket"
                                    title={data.ticket}
                                    onClick={() => {
                                        changeShowTicket(data.ticket);
                                    }}
                                >{data.ticket.replaceAll(
                                    data.ticket.split("-", 1)[0],
                                    data.ticket.slice(0, 6)
                                )}</span>
                                <button
                                    className="bt bt-delete"
                                    onClick={() => {this.deleteTicket(data.ticket)}}
                                >Delete</button>
                                <button
                                    className="bt bt-download"
                                    onClick={() => {this.downloadTicket(data.ticket)}}
                                >Download</button>
                            </div>
                        ))}
                    </div>
                </Block>
            </div>
        );
    }
}
