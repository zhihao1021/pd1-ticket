import React from "react";
import hljs from "highlight.js/lib/core";
import c from "highlight.js/lib/languages/cpp";

// import 'highlight.js/styles/atom-one-dark-reasonable.css';
// import 'highlight.js/styles/atom-one-dark.css';
import 'highlight.js/styles/atom-one-light.css';

import { copy, downloadBlob } from "../../utils";

import "./index.scss";

hljs.registerLanguage("c", c);

type propsType = Readonly<{
    hash: string | null,
    code: string | null,
    fileName: string,
}>;

type stateType = Readonly<{
    message: string,
}>;

export default class CodeBox extends React.Component<propsType, stateType> {
    copyLink: () => void;
    copyCode: () => void;
    constructor(props: propsType) {
        super(props);

        this.state = {
            message: ""
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
            const {code} = this.props;
            if (code === null) {
                this.setState({message: `複製程式碼失敗`});
                return;
            }
            copy(code, "程式碼", (s) => {this.setState({message: s})});
        }
        this.copyLink = this.copyLink.bind(this);
        this.copyCode = this.copyCode.bind(this);
        this.downloadCurrentTicket = this.downloadCurrentTicket.bind(this);
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        if (this.props.hash !== null && this.props.hash !== "" && this.props.hash !== prevProps.hash) {
            this.setState({
                message: ""
            });
        }
    }

    downloadCurrentTicket() {
        const {
            code,
            fileName
        } = this.props;
        if (code !== null) {
            if (downloadBlob(new File([code], fileName), fileName)) {
                this.setState({message: `下載程式碼成功`,});
                return;
            }
        }
        this.setState({message: `下載程式碼失敗`,});
        return;
    }

    render(): React.ReactNode {
        const {
            code
        } = this.props;
        const {
            message
        } = this.state;
        return (
            <div id="codeBox" className="block">
                <h2>Code Preview</h2>
                <div className="secBlock block">
                    <div className="buttonBar">
                        <div className="copyLink" onClick={this.copyLink}>Copy Link</div>
                        <div className="copyCode" onClick={this.copyCode}>Copy Code</div>
                        <div className="download" onClick={this.downloadCurrentTicket}>Download</div>
                        <div className="message left">{message}</div>
                    </div>
                    {
                        code === null? 
                        <div className="emptyBox">File Not Found</div> :
                        <pre>
                            <code dangerouslySetInnerHTML={{
                                __html: hljs.highlight(code, {language: "c"}).value
                            }} />
                                {/* {code}
                            </code> */}
                        </pre>
                    }
                </div>
            </div>
        );
    }
}
