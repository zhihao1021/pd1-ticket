import axios from "axios";
import React from "react";

import InfoBox from "./InfoBox";

import { apiEndPoint } from "../config";

import "./index.scss";

type propsType = Readonly<{
    show: boolean,
    hash: string | null,
    switchPage: (page: number) => void,
    switchLoading: (status?: boolean) => void,
}>;
type stateType = Readonly<{
    code: string | null,
    buttonMessage: string,
}>;

export default class CodePage extends React.Component<propsType, stateType> {
    copyLink: () => void;
    copyCode: () => void;
    constructor(props: propsType) {
        super(props);

        this.state = {
            code: null,
            buttonMessage: "",
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
    }

    componentDidMount(): void {
        this.getTicket(this.props.hash);
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        if (this.props.hash === null || this.props.hash === prevProps.hash) return;
        this.getTicket(this.props.hash);
    }

    getTicket(hash: string | null) {
        if (hash === null) return;
        this.props.switchLoading(true);
        axios.get(`${apiEndPoint}/ticket/${hash}`, { withCredentials: true }).then(
            (response) => {
                this.setState({
                    code: response.data
                });
            }
        ).catch(
            () => {
                this.setState({
                    code: null
                })
            }
        ).finally(
            () => {
                this.props.switchLoading(false);
            }
        );
    }

    copy(context?: string, name?: string) {
        if (context === null || context === undefined) {
            this.setState({buttonMessage: `複製${name}失敗`});
            return;
        }
        navigator.clipboard.writeText(context).then(
            () => {
                this.setState({buttonMessage: `複製${name}成功`,});
            }
        ).catch(
            () => {
                this.setState({buttonMessage: `複製${name}失敗`,});
            }
        )
    }

    render(): React.ReactNode {
        const {show, hash} = this.props;
        const {
            code,
            buttonMessage,
        } = this.state;

        let fileDateTime = hash?.split("-", 2)[1];
        fileDateTime = fileDateTime?.replace(
            "T", " "
        ).replaceAll("_", "/").replaceAll(".", ":");
        const fileName = decodeURI(hash?.split("-", 3)[2] ?? "");
        return (
            <div id="codePage" className={show ? "page show" : "page"}>
                <div
                    className="lastPage"
                    onClick={()=>{window.location.hash=""}}
                >{"< Last Page"}</div>
                <div className="data block">
                    <h2>Info</h2>
                    <InfoBox title="上傳時間" context={fileDateTime ?? ""} />
                    <InfoBox title="檔案名稱" context={fileName ?? ""} />
                    <InfoBox title="Ticket ID" className="ticketId" context={decodeURI(hash ?? "")} />
                </div>
                <div className="code block">
                    <h2>Code Preview</h2>
                    <div className="secBlock block">
                        <div className="buttonBar">
                            <div className="copyLink" onClick={this.copyLink}>Copy Link</div>
                            <div className="copyCode" onClick={this.copyCode}>Copy Code</div>
                            <a href={`${apiEndPoint}/ticket/${hash}`}>Download</a>
                            <div className="message">{buttonMessage}</div>
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
