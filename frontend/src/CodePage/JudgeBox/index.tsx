import React from "react";
import stripAnsi from "strip-ansi";

import { copy, downloadBlob } from "../../utils";

import "./index.scss"

const Convert = require('ansi-to-html');
const convert = new Convert();

type propsType = Readonly<{
    show: boolean,
    context: string,
    switchJudge: (status?: boolean) => void
}>;
type stateType = Readonly<{
    message: string
}>;

export default class JudgeBox extends React.Component<propsType, stateType> {
    copyCode: () => void
    copyNoCode: () => void
    constructor(props: propsType) {
        super(props);

        this.state = {
            message: ""
        };

        this.copyCode = () => {
            copy(this.props.context, "輸出結果", (s) => {this.setState({message: s})});
        }
        this.copyNoCode = () => {
            const context = stripAnsi(this.props.context);
            copy(context, "輸出結果", (s) => {this.setState({message: s})});
        }
        this.copyCode = this.copyCode.bind(this);
        this.copyNoCode = this.copyNoCode.bind(this);
        this.downloadCurrentTicket = this.downloadCurrentTicket.bind(this);
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        if (this.props.show && !prevProps.show) {
            this.setState({message: ""});
        }
    }

    downloadCurrentTicket() {
        const {
            context
        } = this.props;
        if (downloadBlob(new File([context], "result.txt"), "result.txt")) {
            this.setState({message: `下載輸出結果成功`,});
            return;
        }
        this.setState({message: `下載程式碼失敗`,});
        return;
    }

    render(): React.ReactNode {
        const {
            show,
            context,
            switchJudge
        } = this.props;
        const {
            message
        } = this.state
        return (
            <div id="judgeBox" className={show ? "page show" : "page"}>
                <div className="block">
                    <h2>Judge Result</h2>
                    <div className="secBlock block">
                        <pre>
                            <code dangerouslySetInnerHTML={{__html: convert.toHtml(context)}} />
                        </pre>
                        <div className="buttonBar">
                            <div className="copyCode" onClick={this.copyCode}>Copy</div>
                            <div className="copyLink" onClick={this.copyNoCode}>Copy Without ANSI</div>
                            <div className="download" onClick={this.downloadCurrentTicket}>Download</div>
                            <div className="message">{message}</div>
                            <div className="Back" onClick={() => {switchJudge(false);}}>Back</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
