import React from "react";
import hljs from "highlight.js/lib/core";
import c from "highlight.js/lib/languages/cpp";
import init, { format } from '@wasm-fmt/clang-format';

import { copy, downloadBlob } from "../../utils";

// import 'highlight.js/styles/atom-one-dark-reasonable.css';
// import 'highlight.js/styles/atom-one-dark.css';
import 'highlight.js/styles/atom-one-light.css';

import "./index.scss";

hljs.registerLanguage("c", c);

type propsType = Readonly<{
    hash: string | null,
    code: string | null,
    fileName: string,
    format: boolean,
    switchFormat: (status?: boolean) => void,
}>;

type stateType = Readonly<{
    message: string,
    inited: boolean,
    formattedCode: string
}>;

export default class CodeBox extends React.Component<propsType, stateType> {
    copyLink: () => void;
    copyCode: () => void;
    constructor(props: propsType) {
        super(props);

        this.state = {
            message: "",
            inited: false,
            formattedCode: "",
        };

        this.copyLink = () => {
            const {hash} = this.props;
            if (hash === null || hash === "") {
                this.setState({message: `複製連結失敗`});
                return;
            }
            copy(window.location.href, "連結", (s) => {this.setState({message: s})});
        }
        this.copyCode = () => {
            const {
                code,
                format,
            } = this.props;
            const {
                formattedCode
            } = this.state;
            const chooseCode = format ? formattedCode : code;
            if (chooseCode === null) {
                this.setState({message: `複製程式碼失敗`});
                return;
            }
            copy(chooseCode, "程式碼", (s) => {this.setState({message: s})});
        }
        this.copyLink = this.copyLink.bind(this);
        this.copyCode = this.copyCode.bind(this);
        this.downloadCurrentTicket = this.downloadCurrentTicket.bind(this);

        init().then(() => {this.setState({inited: true})});
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        const {
            hash,
            code
        } = this.props;
        const {
            inited
        } = this.state;
        if (hash !== null && hash !== "" && hash !== prevProps.hash) {
            this.setState({
                message: ""
            });
        }

        if ((code !== prevProps.code || (inited && !prevState.inited)) && code !== null) {
            if (!inited) {
                this.setState({
                    formattedCode: code
                });
            }
            else {
                this.setState({
                    formattedCode: format(
                        code,
                        "",
                        JSON.stringify({
                            BasedOnStyle: "Google",
                            IndentWidth: 4,
                            ColumnLimit: 0,
                        })
                    )
                });
            }
        }
    }

    downloadCurrentTicket() {
        const {
            code,
            fileName,
            format,
        } = this.props;
        const {
            formattedCode
        } = this.state;
        const chooseCode = format ? formattedCode : code;
        if (chooseCode !== null) {
            if (downloadBlob(new File([chooseCode], fileName), fileName)) {
                this.setState({message: `下載程式碼成功`,});
                return;
            }
        }
        this.setState({message: `下載程式碼失敗`,});
        return;
    }

    render(): React.ReactNode {
        const {
            code,
            format,
            switchFormat,
        } = this.props;
        const {
            message,
            formattedCode,
        } = this.state;

        return (
            <div id="codeBox" className="block">
                <h2>Code Preview</h2>
                <div className="secBlock block">
                    <div className="buttonBar">
                        <div className="copyLink" onClick={this.copyLink}>Copy Link</div>
                        <div className="copyCode" onClick={this.copyCode}>Copy Code</div>
                        <div className="download" onClick={this.downloadCurrentTicket}>Download</div>
                        <div
                            className="formatCode"
                            onClick={() => {switchFormat();}}
                        >{format ? "UnFormat" : "Format"}</div>
                        <div className="message left">{message}</div>
                    </div>
                    {
                        code === null ? 
                        <div className="emptyBox">File Not Found</div> :
                        <pre>
                            <code dangerouslySetInnerHTML={{
                                __html: hljs.highlight(format ? formattedCode : code, {language: "c"}).value
                            }} />
                        </pre>
                    }
                </div>
            </div>
        );
    }
}
