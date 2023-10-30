import axios from "axios";
import React from "react";

import InfoBox from "./InfoBox";

import { apiEndPoint } from "../config";

import "./index.scss";

type propsType = Readonly<{
    login: boolean,
    show: boolean,
    hash: string | null,
    switchLoading: (status?: boolean) => void,
}>;
type stateType = Readonly<{
    code: string | null,
    buttonMessage: string,
    dirPath: string,
    filename: string,
}>;

export default class CodePage extends React.Component<propsType, stateType> {
    copyLink: () => void;
    copyCode: () => void;
    constructor(props: propsType) {
        super(props);

        this.state = {
            code: null,
            buttonMessage: "",
            dirPath: "",
            filename: "",
        };

        this.copyLink = () => {
            if (this.props.hash === null) {
                this.setState({buttonMessage: `複製連結失敗`});
                return;
            }
            this.copy(window.location.href, "連結");
        }
        this.copyCode = () => {
            const code = this.state.code;
            if (code === null) {
                this.setState({buttonMessage: `複製程式碼失敗`});
                return;
            }
            this.copy(code, "程式碼");
        }
        this.copyLink = this.copyLink.bind(this);
        this.copyCode = this.copyCode.bind(this);
        this.uploadTicket = this.uploadTicket.bind(this);
    }

    componentDidMount(): void {
        if (this.props.login) {
            this.getTicket(this.props.hash);
        }
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        if (this.props.login && !prevProps.login) {
            this.getTicket(this.props.hash);
            return;
        }
        else if (this.props.hash === null || this.props.hash === prevProps.hash) {
            return;
        }
        this.getTicket(this.props.hash);
    }

    onInputChange(field: string) {
        const __func = (ev: React.ChangeEvent) => {
            let target = ev.target as HTMLInputElement;
            let value = target.value;
            this.setState((state) => {
                let newState = state as {[key: string]: string};
                newState[field] = value;
                return newState as stateType;
            });
        };
        return __func.bind(this);
    }

    getTicket(hash: string | null) {
        if (hash === null) return;
        this.props.switchLoading(true);
        axios.get(
            `${apiEndPoint}/ticket/${hash}`,
        ).then((response) => {
            this.setState({
                code: response.data
            });
        }).catch(() => {
            this.setState({
                code: null
            })
        }).finally(() => {
            this.props.switchLoading(false);
        });
    }

    uploadTicket() {
        const {hash} = this.props;
        if (hash === null) {
            return;
        }
        const {
            dirPath,
            filename
        } = this.state;
        this.props.switchLoading(true);
        axios.postForm(
            `${apiEndPoint}/upload`,
            {
                ticket_id: decodeURI(hash),
                dir_path: dirPath,
                filename: filename
            }
        ).then((response) => {
            this.setState({buttonMessage: `上傳成功: ~/${response.data}`,});
        }).catch(() => {
            this.setState({buttonMessage: "上傳失敗",});
        }).finally(() => {
            this.props.switchLoading(false);
        })
    }

    copy(context?: string, name?: string) {
        if (context === null || context === undefined) {
            this.setState({buttonMessage: `複製${name}失敗`});
            return;
        }
        navigator.clipboard.writeText(context).then(() => {
            this.setState({buttonMessage: `複製${name}成功`,});
        }).catch(() => {
            this.setState({buttonMessage: `複製${name}失敗`,});
        });
    }

    render(): React.ReactNode {
        const {
            login,
            show,
            hash
        } = this.props;
        const {
            code,
            buttonMessage,
            dirPath,
            filename
        } = this.state;
        const token = localStorage.getItem("access_token");

        let fileDateTime = hash?.split("-", 2)[1];
        fileDateTime = fileDateTime?.replace(
            "T", " "
        ).replaceAll("_", "/").replaceAll(".", ":");
        const fileName = decodeURI(hash?.split("-", 3)[2] ?? "");
        return (
            <div id="codePage" className={show && login ? "page show" : "page"}>
                <div
                    className="lastPage"
                    onClick={()=>{window.location.hash=""}}
                >{"< Last Page"}</div>
                <div className="data block">
                    <h2>Info</h2>
                    <InfoBox title="Upload Time" context={fileDateTime ?? ""} />
                    <InfoBox title="File Name" context={fileName ?? ""} />
                    <InfoBox title="Ticket ID" className="ticketId" context={decodeURI(hash ?? "")} />
                </div>
                <div className="code block">
                    <h2>Code Preview</h2>
                    <div className="secBlock block">
                        <div className="buttonBar">
                            <div className="copyLink" onClick={this.copyLink}>Copy Link</div>
                            <div className="copyCode" onClick={this.copyCode}>Copy Code</div>
                            <a className="download" href={`${apiEndPoint}/ticket/download/${hash}?token=${token}`}>Download</a>
                            <div className="message">{buttonMessage}</div>
                            <input
                                className="path"
                                placeholder="Path"
                                value={dirPath}
                                onChange={this.onInputChange("dirPath")}
                            />
                            <input
                                className="filename"
                                placeholder="Filename"
                                value={filename}
                                onChange={this.onInputChange("filename")}
                            />
                            <div className="upload" onClick={this.uploadTicket}>Upload</div>
                        </div>
                        {
                            code === null? 
                            <div className="emptyBox">載入資料錯誤</div> :
                            <pre>
                                <code>
                                    {code}
                                </code>
                            </pre>
                        }
                    </div>
                </div>
            </div>
        )
    }
}
