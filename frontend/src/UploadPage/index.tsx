import axios from "axios";
import React from "react";

import UploadBlock from "./UploadBlock";
import TicketBlock from "./TicketBlock";
import TicketBox from "./TicketBox";

import { apiEndPoint } from "../config";

// import "./index.scss"

type propsType = Readonly<{
    switchLoading: (status?: boolean) => void,
    show: boolean,
}>;
type stateType = Readonly<{
    tickets: Array<string>,
    selectedFile: File | null,
    uploadMessage: string,
}>;

export default class UploadPage extends React.Component<propsType, stateType> {
    constructor(props: propsType) {
        super(props);

        this.state = {
            tickets: [],
            selectedFile: null,
            uploadMessage: "",
        };

        this.selectFile = this.selectFile.bind(this);
        this.sendFile = this.sendFile.bind(this);
        this.getAllTickets = this.getAllTickets.bind(this);
        this.deleteTickets = this.deleteTickets.bind(this);
    }

    componentDidMount(): void {
        this.getAllTickets();
    }

    selectFile(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files === null) return;
        const file: File | null = event.target.files[0] ?? null;
        this.setState(state => {
            return {
                selectedFile: file ?? state.selectedFile,
                uploadMessage: "",
            };
        });
    }

    sendFile() {
        const file = this.state.selectedFile;
        if (file === null) {
            this.setState({
                uploadMessage: "未選擇檔案",
            });
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        this.props.switchLoading(true);
        axios.post
            (`${apiEndPoint}/ticket`,
            formData,
            { withCredentials: true }
        ).then(
            (response) => {
                this.setState({
                    uploadMessage: "",
                    selectedFile: null,
                });
                this.setState(state => {
                    const originTickets = state.tickets;
                    originTickets.push(response.data);
                    return {
                        tickets: originTickets
                    };
                })
            }
        ).catch(
            () => {
                this.setState({
                    uploadMessage: "發生錯誤"
                });
            }
        ).finally(
            () => {
                this.props.switchLoading(false);
            }
        );
    }

    getAllTickets() {
        this.props.switchLoading(true);
        axios.get(`${apiEndPoint}/ticket`, { withCredentials: true }).then(
            (response) => {
                let tickets: Array<string> = response.data;
                tickets.sort((v1, v2) => {
                    let t1 = v1.split("-", 2)[1].replaceAll("_", "").replaceAll(".", "").replace("T", "");
                    let t2 = v2.split("-", 2)[1].replaceAll("_", "").replaceAll(".", "").replace("T", "");
                    return parseInt(t2) - parseInt(t1);
                });
                this.setState({
                    tickets: tickets,
                });
            }
        ).finally(
            () => {
                this.props.switchLoading(false);
            }
        );
    }

    deleteTickets(ticketId: string) {
        this.props.switchLoading(true);
        axios.delete(`${apiEndPoint}/ticket/${ticketId}`, { withCredentials: true }).then(
            () => {
                this.setState(state => {
                    const originTickets = state.tickets;
                    return {
                        tickets: originTickets.filter(value => value !== ticketId),
                    };
                })
            }
        ).catch(
            () => {
                this.getAllTickets();
                alert("發生錯誤")
            }
        ).finally(
            () => {
                this.props.switchLoading(false);
            }
        )
    }

    render(): React.ReactNode {
        const {show} = this.props;
        const {
            tickets,
            selectedFile,
            uploadMessage,
        } = this.state;
        return (
            <div id="uploadPage" className={show ? "page show" : "page"}>
                <UploadBlock
                    selectFile={this.selectFile}
                    sendFile={this.sendFile}
                    selectedFile={selectedFile}
                    uploadMessage={uploadMessage}
                />
                <TicketBlock>
                    {tickets.map((ticketId, index) => 
                        <TicketBox key={index} deleteTicket={this.deleteTickets} ticketId={ticketId}></TicketBox>
                    )}
                </TicketBlock>
            </div>
        );
    }
}
