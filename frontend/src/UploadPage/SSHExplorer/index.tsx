import axios from "axios";
import React from "react";

import { apiEndPoint } from "../../config";
import { downloadBlob } from "../../utils";

import "./index.scss";

type propsType = Readonly<{
    show: boolean,
    switchLoading: (status?: boolean) => void,
    unshiftTicket: (ticket_id: string) => void,
    switchExplorer: (status?: boolean) => void,
}>;
type stateType = Readonly<{
    selectedFiles: Array<string>,
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
            selectedFiles: [],
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

    selectFile(fileName: string, append: boolean=false) {
        this.setState(state => {
            let result = append ? state.selectedFiles : [];
            if (append) {
                console.log(fileName);
                if (result.includes(fileName)) {
                    result = result.filter(file => file !== fileName);
                }
                else result.push(fileName);
            }
            else result.push(fileName);
            return {
                selectedFiles: result,
                message: ""
            }
        })
    }

    sendPullRequest(download: boolean) {
        const {selectedFiles} = this.state;
        if (selectedFiles.length === 0) {
            this.setState({
                message: "No selected file"
            });
            return;
        }

        // 顯示載入畫面
        this.props.switchLoading(true);

        axios.post(
            `${apiEndPoint}/pull`,
            {
                path_list: selectedFiles,
                download: download
            },
        ).then((response) => {
            // 清空選擇檔案
            this.setState({
                message: "",
                selectedFiles: [],
            });
            if (download) {
                downloadBlob(new Blob([response.data]), "download.zip");
            }
            else {
                // 更新列表
                this.props.unshiftTicket(response.data);
                this.props.switchExplorer(false);
                window.location.hash = response.data;
            }
        }).catch((error) => {
            this.setState({
                message: `Error: ${error.response.data.detail}`,
                selectedFiles: []
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
            selectedFiles,
            path,
            directory,
            files,
            message
        } = this.state;
        const selectFileNames = selectedFiles.map(filename => {
            const filenameList = filename.split("/");
            return filenameList[filenameList.length - 1];
        });
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
                                    <span
                                        className="text"
                                        onClick={() => {this.wsEnterFolder(name)}}
                                        title={name}
                                    >{name}</span>
                                </div>)
                            }
                        </div>
                        <div className="box">
                            {
                                files.map((name, index) => <div key={index}>
                                    <span className="ms-o">draft</span>
                                    <span
                                        className="text"
                                        onClick={(event: React.MouseEvent) => {this.selectFile(`${path}/${name}`.replaceAll("//", "/"), event.shiftKey)}}
                                        title={name}
                                    >{name}</span>
                                </div>)
                            }
                        </div>
                    </div>
                    <div className="buttonBar">
                        <div
                            className="path"
                            title={selectFileNames.join(", ")}
                        >File: <span>{selectFileNames.join(", ")}</span></div>
                        <div className="message">{message}</div>
                        <button className="pull" onClick={() => {this.sendPullRequest(false)}}>Pull</button>
                        <button className="download" onClick={() => {this.sendPullRequest(true)}}>Download</button>
                        <button className="cancel" onClick={() => {switchExplorer(false)}}>Cancel</button>
                    </div>
                </div>
            </div>
        )
    }
}
