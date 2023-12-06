import axios from "axios";
import React from "react";

import {
    deleteTicket,
    downloadTicket,
    getAllTickets
} from "../../api/ticket";
import {
    addMessage,
    functionData,
    switchLoading,
} from "../../publicFunction";
import { downloadBlob } from "../../utils";

type propsType = Readonly<{
    show: boolean,
}>;
type stateType = Readonly<{
    ticketArray: Array<{
        ticket: string,
        datetime: string,
    }>,
    popupShow: boolean,
    popupMessage: string,
    popupOK: Function|undefined,
    popupCancel: Function|undefined,
}>;

export default class TicketPageState extends React.Component<propsType, stateType> {
    init: boolean
    constructor(props: propsType) {
        super(props);

        this.state = {
            ticketArray: [],
            popupShow: false,
            popupMessage: "",
            popupOK: undefined,
            popupCancel: undefined,
        };

        this.init = false;

        this.updateTicket = this.updateTicket.bind(this);
        this.deleteTicket = this.deleteTicket.bind(this);
        this.downloadTicket = this.downloadTicket.bind(this);

        functionData["updateTicket"] = this.updateTicket;
    }

    componentDidMount(): void {
        const {show} = this.props;
        if (!show) return;
        this.updateTicket();
        this.init = true;
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        const {show} = this.props;
        if (!prevProps.show && show && !this.init) {
            this.updateTicket();
        }
    }

    updateTicket() {
        switchLoading(true);
        const {ticketArray} = this.state;
        getAllTickets().then((response) => {
            const different = response.filter(x => !ticketArray.map(data => data.ticket).includes(x));
            if (different.length !== 0 || response.length !== ticketArray.length) {
                this.setState({ticketArray: response.map(ticket => ({
                    ticket: ticket,
                    datetime: ticket.split("-", 2)[1],
                }))});
            }
        }).catch(() => {
            addMessage("ERROR", "更新資料失敗。\nUpdate data failed.");
        }).finally(() => {
            switchLoading(false);
        });
    }

    deleteTicket(ticket: string) {
        this.setState({
            popupShow: true,
            popupMessage: "確定要刪除這個Ticket嗎?\nYou sure you want to delete it?",
            popupOK: () => {
                switchLoading(true);
                deleteTicket(ticket).then(() => {
                    addMessage("INFO", "刪除成功。\nDelete success.");
                    this.updateTicket();
                }).catch(() => {
                    addMessage("ERROR", "刪除失敗。\nDelete failed.");
                }).finally(() => {
                    switchLoading(false);
                });
            }
        })
    }

    downloadTicket(ticket: string) {
        downloadTicket(ticket).then((file) => {
            downloadBlob(file, `${ticket}.zip`);
            addMessage("INFO", "下載成功。\nDownload success.");
        }).catch(() => {
            addMessage("ERROR", "下載失敗。\nDownload failed.");
        });
    }
}
