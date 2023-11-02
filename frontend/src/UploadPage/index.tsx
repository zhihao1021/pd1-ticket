import axios from "axios";
import React from "react";

import SSHExplorer from "./SSHExplorer";
import UploadBlock from "./UploadBlock";
import TicketBlock from "./TicketBlock";
import TicketBox from "./TicketBox";

import { apiEndPoint } from "../config";

import "./index.scss"

type propsType = Readonly<{
    login: boolean,
    show: boolean,
    switchLoading: (status?: boolean) => void,
}>;
type stateType = Readonly<{
    tickets: Array<string>,
    selectedFile: File | null,
    uploadMessage: string,
    showExplorer: boolean,
}>;

export default class UploadPage extends React.Component<propsType, stateType> {
    constructor(props: propsType) {
        super(props);

        this.state = {
            tickets: [],
            selectedFile: null,
            uploadMessage: "",
            showExplorer: false
        };

        this.selectFile = this.selectFile.bind(this);
        this.sendFile = this.sendFile.bind(this);
        this.getAllTickets = this.getAllTickets.bind(this);
        this.deleteTicket = this.deleteTicket.bind(this);
        this.unshiftTicket = this.unshiftTicket.bind(this);
        this.switchExplorer = this.switchExplorer.bind(this);
    }

    componentDidMount(): void {
        if (this.props.login) {
            this.getAllTickets();
        }
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        if (this.props.login && !prevProps.login) {
            this.getAllTickets();
        }
    }

    unshiftTicket(ticket_id: string) {
        this.setState(state => {
            const originTickets = state.tickets;
            originTickets.unshift(ticket_id);
            return {
                tickets: originTickets
            };
        })
    }

    switchExplorer(status?: boolean) {
        this.setState(state => {
            return {
                showExplorer: status ?? !state.showExplorer
            };
        });
    }

    // 選擇檔案
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

    // 傳送檔案
    sendFile() {
        // 檢查是否有選擇檔案
        const file = this.state.selectedFile;
        if (file === null) {
            this.setState({uploadMessage: "No selected file."});
            return;
        }
        // 顯示載入畫面
        this.props.switchLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        // 發送請求
        axios.post(`${apiEndPoint}/ticket`,
            formData
        ).then((response) => {
            // 清空選擇檔案
            this.setState({
                uploadMessage: "",
                selectedFile: null,
            });
            // 更新列表
            this.unshiftTicket(response.data);
            window.location.hash = response.data;
        }).catch((error) => {
            this.setState({
                uploadMessage: `Error: ${error.response.data.detail}`,
                selectedFile: null
            });
        }).finally(() => {
            // 關閉載入畫面
            this.props.switchLoading(false);
        });
    }

    // 取得所有Ticket
    getAllTickets() {
        // 顯示載入畫面
        this.props.switchLoading(true);
        
        // 發送請求
        axios.get(
            `${apiEndPoint}/ticket`,
        ).then((response) => {
            let tickets: Array<string> = response.data;
            // 依日期排序
            tickets.sort((v1, v2) => {
                let t1 = v1.split("-", 2)[1].replaceAll("_", "").replaceAll(".", "").replace("T", "");
                let t2 = v2.split("-", 2)[1].replaceAll("_", "").replaceAll(".", "").replace("T", "");
                return parseInt(t2) - parseInt(t1);
            });
            this.setState({
                tickets: tickets,
            });
        }).finally(() => {
            // 關閉載入畫面
            this.props.switchLoading(false);
        });
    }

    // 刪除Ticket
    deleteTicket(ticketId: string) {
        // 顯示載入畫面
        this.props.switchLoading(true);
        
        // 發送請求
        axios.delete(
            `${apiEndPoint}/ticket/${ticketId}`,
        ).then(() => {
            this.setState(state => {
                const originTickets = state.tickets;
                return {
                    tickets: originTickets.filter(value => value !== ticketId),
                };
            })
        }).catch(() => {
            this.getAllTickets();
            alert("Error")
        }).finally(() => {
            // 關閉載入畫面
            this.props.switchLoading(false);
        });
    }

    render(): React.ReactNode {
        const {
            login,
            show,
            switchLoading
        } = this.props;
        const {
            tickets,
            selectedFile,
            uploadMessage,
            showExplorer,
        } = this.state;

        const classList = ["page"];
        if (show && login) {
            classList.push("show");
        }
        if (showExplorer) {
            classList.push("showExplorer")
        }
        return (
            <div id="uploadPage" className={classList.join(" ")}>
                <UploadBlock
                    selectFile={this.selectFile}
                    sendFile={this.sendFile}
                    selectedFile={selectedFile}
                    uploadMessage={uploadMessage}
                    switchExplorer={this.switchExplorer}
                />
                <TicketBlock>
                    {tickets.map((ticketId, index) => 
                        <TicketBox
                            key={index}
                            ticketId={ticketId}
                            deleteTicket={this.deleteTicket}
                            switchLoading={switchLoading}
                        ></TicketBox>
                    )}
                </TicketBlock>
                <SSHExplorer
                    show={showExplorer}
                    switchLoading={switchLoading}
                    unshiftTicket={this.unshiftTicket}
                    switchExplorer={this.switchExplorer}
                />
            </div>
        );
    }
}
