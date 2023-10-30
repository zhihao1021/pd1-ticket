import React from "react";
import { apiEndPoint } from "../../config";

import "./index.scss";
import axios from "axios";

type propsType = Readonly<{
    show: boolean,
    switchLoading: (status?: boolean) => void,
    unshiftTicket: (ticket_id: string) => void,
    switchExplorer: (status?: boolean) => void,
}>;
type stateType = Readonly<{
    selectedFile: string,
    path: string,
    directory: Array<string>,
    files: Array<string>,
    message: string,
}>;

export default class SSHExplorer extends React.Component<propsType, stateType> {
    ws?: WebSocket
    constructor(props: propsType) {
        super(props);

        this.state = {
            selectedFile: "",
            path: "",
            directory: [],
            files: [],
            message: "",
        };
        this.ws = undefined;

        this.wsUpdate = this.wsUpdate.bind(this);
        this.sendPullRequest = this.sendPullRequest.bind(this);
        // const token = localStorage.getItem("access_token")
        // const originUrl = apiEndPoint.startsWith("http") ? apiEndPoint : `${window.location.origin}${apiEndPoint}`;
        // this.ws = new WebSocket(`${originUrl.replace("http", "ws")}/pull/explorer?token=${token}`);
        // this.ws.addEventListener("message", this.wsUpdate);

    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        if (!prevProps.show && this.props.show && (this.ws === undefined || this.ws?.readyState !== WebSocket.OPEN)) {
            if (this.ws?.readyState !== WebSocket.CLOSED) {
                this.ws?.close()
            }
            this.props.switchLoading(true);
            const token = localStorage.getItem("access_token")
            const originUrl = apiEndPoint.startsWith("http") ? apiEndPoint : `${window.location.origin}${apiEndPoint}`;
            this.ws = new WebSocket(`${originUrl.replace("http", "ws")}/pull/explorer?token=${token}`);
            this.ws.addEventListener("message", this.wsUpdate);
        }
        else if (prevProps.show && !this.props.show && !(this.ws === undefined || this.ws?.readyState === WebSocket.CLOSED)) {
            this.ws.close()
            this.ws.removeEventListener("message", this.wsUpdate);
        }
    }

    wsUpdate(event: MessageEvent) {
        const data: {
            path: string,
            files: Array<string>,
            directory: Array<string>
        } = JSON.parse(event.data)
        this.setState({
            path: data.path,
            files: data.files,
            directory: data.directory.filter(s => s !== "."),
        })
        this.props.switchLoading(false);
    }

    wsEnterFolder(directoryName: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.props.switchLoading(true);
            this.ws.send(directoryName);
        }
    }

    selectFile(fileName: string) {
        this.setState(state => {
            return {
                selectedFile: `${state.path}/${fileName}`,
                message: ""
            }
        })
    }

    sendPullRequest() {
        const {selectedFile} = this.state;
        if (selectedFile === "") {
            this.setState({
                message: "No selected file"
            });
            return;
        }

        // 顯示載入畫面
        this.props.switchLoading(true);
        const formData = new FormData();
        formData.append("path", selectedFile);

        axios.post(
            `${apiEndPoint}/pull`,
            formData
        ).then((response) => {
            // 清空選擇檔案
            this.setState({
                message: "",
                selectedFile: "",
            });
            // 更新列表
            this.props.unshiftTicket(response.data);
            this.props.switchExplorer(false);
            window.location.hash = response.data;
        }).catch((error) => {
            console.log(error);
            this.setState({
                message: `Error: ${error.response.data.detail}`,
                selectedFile: ""
            });
        }).finally(() => {
            // 關閉載入畫面
            this.props.switchLoading(false);
        });
    }

    render(): React.ReactNode {
        const {
            show,
            switchExplorer,
        } = this.props;
        const {
            selectedFile,
            path,
            directory,
            files,
            message
        } = this.state;
        return (
            <div id="sshExplorer" className={show ? "page show" : "page"}>
                <div className="block">
                    <h2>SSH Explorer</h2>
                    <div className="selectBlock">
                        <div className="path">{path}</div>
                        <div className="box">
                            {
                                directory.map((name, index) => <div key={index}>
                                    <span className="ms-o">folder_open</span>
                                    <span className="text" onClick={() => {this.wsEnterFolder(name)}}>{name}</span>
                                </div>)
                            }
                        </div>
                        <div className="box">
                            {
                                files.map((name, index) => <div key={index}>
                                    <span className="ms-o">draft</span>
                                    <span className="text" onClick={() => {this.selectFile(name)}}>{name}</span>
                                </div>)
                            }
                        </div>
                    </div>
                    <div className="buttonBar">
                        <div className="path">File: <span>{selectedFile}</span></div>
                        <div className="message">{message}</div>
                        <button className="upload" onClick={this.sendPullRequest}>Pull</button>
                        <button className="cancel" onClick={() => {switchExplorer(false)}}>Cancel</button>
                    </div>
                </div>
            </div>
        )
    }
}
