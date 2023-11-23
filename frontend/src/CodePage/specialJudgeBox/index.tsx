import axios from "axios";
import React from "react";

import Selection from "../../Selection";

import { apiEndPoint } from "../../config";

import { copy, downloadBlob } from "../../utils";

import "./index.scss"

type propsType = Readonly<{
    show: boolean,
    hash: string,
    judgeCommand: string,
    switchJudge: (status?: boolean) => void
    switchLoading: (status?: boolean) => void
    setUpperMessage: (message: string) => void
}>;
type stateType = Readonly<{
    message: string,
    firstBlock?: string,
    secondBlock?: string,
    firstTitle: string,
    secondTitle: string,
    showTestcaseButton: boolean,
    tabList: Array<string>,
    tabOption: number,
    responseData?: ResponseData,
    exportOption: number,
}>;

type ResponseData = Readonly<{
    error: boolean,
    diff: string,
    stderr: string,
    testcase: string,
    answer: string,
    user_output: string,
}>

export default class SpecialJudgeBox extends React.Component<propsType, stateType> {
    export: (download: boolean) => void
    firstRef: React.RefObject<HTMLPreElement>
    secondRef: React.RefObject<HTMLPreElement>
    constructor(props: propsType) {
        super(props);

        this.state = {
            message: "",
            tabList: [],
            tabOption: 0,
            firstBlock: undefined,
            secondBlock: undefined,
            firstTitle: "",
            secondTitle: "",
            responseData: undefined,
            showTestcaseButton: false,
            exportOption: 0,
        };

        this.firstRef = React.createRef();
        this.secondRef = React.createRef();

        this.export = (download: boolean) => {
            const {
                responseData,
                exportOption
            } = this.state;
            if (responseData === undefined) return;
            const data = [
                responseData.testcase,
                responseData.answer,
                responseData.user_output,
            ][exportOption];
            const name = ["測資", "答案", "輸出"][exportOption]
            const fileName = ["testcase", "answer", "output"][exportOption]
            if (download) {
                if (downloadBlob(new Blob([data]), fileName)) {
                    this.setState({message: `${name}下載成功`});
                }
            }
            else copy(data, name, (s) => {this.setState({message: s})});
        }

        this.switchTab = this.switchTab.bind(this);
        this.syncScroll = this.syncScroll.bind(this);
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        if (!this.props.show && prevProps.show) {
            this.setState({
                message: "",
                tabList: [],
                tabOption: 0,
                firstBlock: undefined,
                secondBlock: undefined,
                firstTitle: "",
                secondTitle: "",
                responseData: undefined,
                showTestcaseButton: false,
            });
        }
        else if (this.props.show && !prevProps.show) {
            this.judge();
        }

        if (this.state.responseData !== undefined && prevState.responseData === undefined) {
            this.switchTab(0);
        }
    }

    switchTab(tabIndex: number) {
        const {
            responseData,
            tabList,
        } = this.state;
        if (tabIndex >= tabList.length || responseData === undefined) return;
        this.setState({tabOption: tabIndex});
        if (responseData.error) {
            this.setState({
                firstBlock: responseData.stderr,
                firstTitle: "Error Output",
                secondBlock: undefined,
                secondTitle: "",
            })
            return;
        }
        switch (tabIndex) {
            case 0:
                this.setState({
                    firstBlock: responseData.diff,
                    firstTitle: "Diff Result",
                    secondBlock: undefined,
                    secondTitle: "",
                })
                break;
            case 1:
                this.setState({
                    firstBlock: responseData.answer,
                    firstTitle: "Answer",
                    secondBlock: responseData.user_output,
                    secondTitle: "Your Output",
                })
                break;
            case 2:
                this.setState({
                    firstBlock: responseData.testcase,
                    firstTitle: "Testcase",
                    secondBlock: undefined,
                    secondTitle: "",
                })
                break;
        }
    }

    judge() {
        const {
            hash,
            judgeCommand,
            switchJudge,
            switchLoading,
            setUpperMessage,
        } = this.props;

        switchLoading(true);
        axios.get(
            `${apiEndPoint}/special_judge/${judgeCommand}/${hash}`
        ).then((response) => {
            const data = response.data as ResponseData;
            if (data.error) {
                this.setState({
                    message: "",
                    tabList: ["Result"],
                    tabOption: 0,
                    responseData: data,
                    showTestcaseButton: false,
                });
            }
            else {
                this.setState({
                    message: "",
                    tabList: ["Result", "Output", "Testcase"],
                    tabOption: 0,
                    responseData: data,
                    showTestcaseButton: true,
                });
            }
        }).catch(() => {
            switchJudge(false);
            setUpperMessage("測試失敗。");
        }).finally(() => {
            switchLoading(false);
        })
    }

    syncScroll(event: React.UIEvent<HTMLPreElement>) {
        const target = event.target as HTMLPreElement;
        if (target === undefined) return;
        if (this.state.secondBlock === undefined) return;
        const firstPre = this.firstRef.current;
        const secondPre = this.secondRef.current;
        if (!(firstPre && secondPre)) return;
        if (target.className === "firstPre") {
            secondPre.scrollTop = Math.min(
                secondPre.scrollHeight - secondPre.clientHeight,
                target.scrollTop
            );
        }
        else {
            firstPre.scrollTop = Math.min(
                firstPre.scrollHeight - firstPre.clientHeight,
                target.scrollTop
            );
        }
    }

    render(): React.ReactNode {
        const {
            show,
            switchJudge
        } = this.props;
        const {
            message,
            firstBlock,
            secondBlock,
            firstTitle,
            secondTitle,
            showTestcaseButton,
            tabList,
            tabOption,
            exportOption,
        } = this.state

        let firstContent: string | Array<React.ReactElement> | undefined = firstBlock;
        let secondContent: string | Array<React.ReactElement> | undefined = secondBlock;

        if (tabOption == 1 && firstBlock && secondBlock) {
            const firstSplit = firstBlock.split("\n");
            const secondSplit = secondBlock.split("\n");

            firstContent = firstSplit.map((value, index) => (
                <span
                    key={index}
                    className={value !== secondSplit[index] ? "diff" : undefined}
                >{value}</span>
            ));
            secondContent = secondSplit.map((value, index) => (
                <span
                    key={index}
                    className={value !== firstSplit[index] ? "diff" : undefined}
                >{value}</span>
            ));
        }

        return (
            <div id="specialJudgeBox" className={show ? "page show" : "page"}>
                <div className="block">
                    <h2>Judge Result</h2>
                    <div className="secBlock block">
                        <div className="buttonBar">
                            {
                                showTestcaseButton ?<Selection
                                    value={exportOption}
                                    options={["Testcase", "Answer", "Output"]}
                                    changeValue={(value) => {this.setState({exportOption: value})}}
                                /> : undefined
                            }
                            {
                                showTestcaseButton ? <div
                                    className="copyCode"
                                    onClick={() => {this.export(false)}}
                                >Copy</div> : undefined
                            }
                            {
                                showTestcaseButton ? <div
                                    className="download"
                                    onClick={() => {this.export(true)}}
                                >Download</div> : undefined
                            }
                            <div className="message">{message}</div>
                            <Selection
                                value={tabOption}
                                options={tabList}
                                changeValue={this.switchTab}
                            />
                            <div className="back" onClick={() => {switchJudge(false);}}>Back</div>
                        </div>
                        <div className="codeBlock">
                            {
                                firstBlock ? <div>
                                    <div>{firstTitle}</div>
                                    <pre
                                        ref={this.firstRef}
                                        className="firstPre"
                                        onScroll={this.syncScroll}
                                    >
                                        <div>
                                            {
                                                tabOption === 1 ? <code className="num">
                                                    {firstBlock.split("\n").map((v, index) => `${index+1}\n`)}
                                                </code>: undefined
                                            }
                                            <code className="wrap">{firstContent}</code>
                                        </div>
                                    </pre>
                                </div> : undefined
                            }
                            {
                                secondBlock ? <div>
                                    <div>{secondTitle}</div>
                                    <pre
                                        ref={this.secondRef}
                                        className="secondPre"
                                        onScroll={this.syncScroll}
                                    >
                                        <div>
                                            {
                                                tabOption === 1 ? <code className="num">
                                                    {secondBlock.split("\n").map((v, index) => `${index+1}\n`)}
                                                </code>: undefined
                                            }
                                            <code className="wrap">{secondContent}</code>
                                        </div>
                                    </pre>
                                </div> : undefined
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
