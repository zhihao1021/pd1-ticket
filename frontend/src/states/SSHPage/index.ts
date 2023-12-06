import React from "react";

import {
    downloadFiles,
    pullFiles
} from "../../api/ssh";
import {
    addMessage,
    changeShowTicket,
    switchLoading
} from "../../publicFunction";
import { setting, downloadBlob } from "../../utils";

type propsType = Readonly<{
    show: boolean
}>;
type stateType = Readonly<{
    path: string,
    directoryArray: Array<string>,
    fileArray: Array<string>,
    selectedFileArray: Array<string>,
}>;

export default class SSHPageState extends React.Component<propsType, stateType> {
    ws?: WebSocket
    wsAccept: boolean
    constructor(props: propsType) {
        super(props);

        this.state = {
            path: setting("sshPath", ".", "read"),
            directoryArray: [],
            fileArray: [],
            selectedFileArray: []
        };

        this.wsAccept = false

        if (props.show) {
            this.#connectWs();
        }
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        const {
            show
        } = this.props;
        if (!prevProps.show && show) {
            this.#connectWs();
        }
        else if (prevProps.show && !show) {
            this.#disconnectWs();
        }
    }

    #connectWs() {
        if (this.ws === undefined || this.ws?.readyState === WebSocket.CLOSED) {
            const apiEndPoint = process.env.REACT_APP_API_END_POINT;
            if (!apiEndPoint) return;
            const wsEndPoint = apiEndPoint.startsWith("http") ?
                apiEndPoint.replace("http", "ws") :
                `${window.location.origin}${apiEndPoint}`.replace("http", "ws");
            this.ws = new WebSocket(`${wsEndPoint}/pull/explorer`)
            this.ws.addEventListener("message", this.#wsOnMessage.bind(this));
            this.wsAccept = false;
            switchLoading(true);
            this.ws.onopen = () => {
                this.ws?.send(localStorage.getItem("access_token") ?? "");
            };

        }
    }

    #disconnectWs() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.close();
            this.wsAccept = false;
        }
    }

    #wsOnMessage(event: MessageEvent) {
        if (this.wsAccept === false) {
            const isAccept = event.data === "accept";
            this.wsAccept = isAccept;
            this.ws?.send(this.state.path);
            return;
        }
        const data: {
            path: string,
            files: Array<string>,
            directory: Array<string>
        } = JSON.parse(event.data);
        this.setState({
            path: data.path,
            directoryArray: data.directory.filter(v => v !== "."),
            fileArray: data.files,
        });
        setting("sshPath", data.path, "write");
        switchLoading(false);
    }

    enterDirectory(directoryName: string) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN && this.wsAccept) {
            switchLoading(true);
            this.ws?.send(directoryName);
        }
    }

    selectFile(fileName: string, shiftKey: boolean=false) {
        const {path} = this.state;
        this.setState(state => {
            let originArray = state.selectedFileArray;

            if (shiftKey) {
                if (originArray.includes(`${path}/${fileName}`)) {
                    originArray = originArray.filter(v => v !== `${path}/${fileName}`);
                }
                else {
                    originArray.push(`${path}/${fileName}`);
                }
            }
            else {
                if (originArray.length === 1 && originArray[0] === `${path}/${fileName}`) {
                    originArray = [];
                }
                else {
                    originArray = [`${path}/${fileName}`];
                }
            }
            return {
                selectedFileArray: originArray,
            };
        })
    }

    downloadFiles() {
        const {selectedFileArray} = this.state;
        if (selectedFileArray.length === 0) {
            addMessage("WARNING", "未選擇檔案。\nNo selected files.")
            return;
        }
        switchLoading(true);
        downloadFiles(selectedFileArray).then((file) => {
            downloadBlob(file, "download.zip");
            addMessage("INFO", "下載成功。\nDownload success.");
        }).catch(() => {
            addMessage("INFO", "下載失敗。\nDownload failed.");
        }).finally(() => {
            this.setState({selectedFileArray: []});
            switchLoading(false);
        })
    }

    pullFiles() {
        const {selectedFileArray} = this.state;
        if (selectedFileArray.length === 0) {
            addMessage("WARNING", "未選擇檔案。\nNo selected files.")
            return;
        }
        switchLoading(true);
        pullFiles(selectedFileArray).then((ticket) => {
            addMessage("INFO", "拉取成功。\nDownload success.");
            changeShowTicket(ticket);
        }).catch(() => {
            addMessage("INFO", "拉取失敗。\nDownload failed.");
        }).finally(() => {
            this.setState({selectedFileArray: []});
            switchLoading(false);
        })
    }
}
