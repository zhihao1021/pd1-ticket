import React from "react";
import stripAnsi from "strip-ansi";

import JudgeResult from "../../schemas/judgeResult";

import { functionData } from "../../publicFunction";
import { copy, downloadBlob } from "../../utils";
import { addMessage } from "../../publicFunction";

type propsType = Readonly<{
    show: boolean
}>;
type stateType = Readonly<{
    selectedTab: number,
    output: string
    testcaseName: Array<string>,
    selectedTestcase: number,
    testcase: Array<string>,
    answer: Array<string>,
    userOutput: Array<string>,
    dirPath: string,
}>;

export default class JudgePageState extends React.Component<propsType, stateType> {
    ref1: React.RefObject<HTMLPreElement>
    ref2: React.RefObject<HTMLPreElement>
    constructor(props: propsType) {
        super(props);

        this.state = {
            selectedTab: 0,
            output: "",
            testcaseName: [],
            selectedTestcase: 0,
            testcase: [],
            answer: [],
            userOutput: [],
            dirPath: "",
        };

        this.switchSelectedTab = this.switchSelectedTab.bind(this);
        this.switchSelectedTestcase = this.switchSelectedTestcase.bind(this);
        this.changeShowJudge = this.changeShowJudge.bind(this);
        this.copy = this.copy.bind(this);
        this.download = this.download.bind(this);

        this.ref1 = React.createRef();
        this.ref2 = React.createRef();

        functionData["changeShowJudge"] = this.changeShowJudge;
    }

    switchSelectedTab(index: number) {
        this.setState({selectedTab: index});
    }

    switchSelectedTestcase(index: number) {
        this.setState({selectedTestcase: index});
    }

    changeShowJudge(judgeResult: JudgeResult) {
        this.setState({
            selectedTab: 0,
            output: judgeResult.output,
            testcaseName: judgeResult.testcase_name,
            selectedTestcase: 0,
            testcase: judgeResult.testcase,
            answer: judgeResult.answer,
            userOutput: judgeResult.user_output,
            dirPath: judgeResult.dir_path,
        });
    }

    copy(index: 0|1) {
        const {
            selectedTab,
            selectedTestcase,
            output,
            testcase,
            answer,
            userOutput,
        } = this.state;

        switch (selectedTab) {
            case 0:
                copy(stripAnsi(output)).then(() => {
                    addMessage("INFO", "複製輸出成功。\nCopy output success.");
                }).catch(() => {
                    addMessage("ERROR", "複製輸出失敗。\nCopy output failed.");
                })
                break;
            case 1:
                const result = index === 0 ? answer[selectedTestcase] : userOutput[selectedTestcase];
                copy(result).then(() => {
                    addMessage(
                        "INFO",
                        `複製${index === 0 ? "解答" : "使用者輸出"}成功。\nCopy ${index === 0 ? "answer" : "user output"} success.`
                    );
                }).catch(() => {
                    addMessage(
                        "ERROR",
                        `複製${index === 0 ? "解答" : "使用者輸出"}失敗。\nCopy ${index === 0 ? "answer" : "user output"} failed.`
                    );
                })
                break
            case 2:
                copy(testcase[selectedTestcase]).then(() => {
                    addMessage("INFO", "複製測資成功。\nCopy testcase success.");
                }).catch(() => {
                    addMessage("ERROR", "複製測資失敗。\nCopy testcase failed.");
                })
                break;
        }
    }

    download(index: 0|1) {
        const {
            selectedTab,
            selectedTestcase,
            output,
            testcase,
            answer,
            userOutput,
        } = this.state;

        switch (selectedTab) {
            case 0:
                try {
                    downloadBlob(new Blob([stripAnsi(output)]), "output.txt");
                    addMessage("INFO", "下載輸出成功。\nDownload output success.");
                }catch { addMessage("INFO", "下載輸出失敗。\nDownload output failed."); }
                break;
            case 1:
                const result = index === 0 ? answer[selectedTestcase] : userOutput[selectedTestcase];
                try {
                    downloadBlob(new Blob([result]), `${index === 0 ? "answer" : "user_output"}${selectedTestcase+1}.txt`);
                    addMessage(
                        "INFO",
                        `下載${index === 0 ? "解答" : "使用者輸出"}成功。\nDownload ${index === 0 ? "answer" : "user output"} success.`
                    );
                }catch {
                    addMessage(
                        "ERROR",
                        `下載${index === 0 ? "解答" : "使用者輸出"}失敗。\nDownload ${index === 0 ? "answer" : "user output"} failed.`
                    );
                }
                break
            case 2:
                try {
                    downloadBlob(new Blob([testcase[selectedTestcase]]), `testcase${selectedTestcase+1}.txt`);
                    addMessage("INFO", "下載測資成功。\nDownload testcase success.");
                }catch { addMessage("INFO", "下載測資失敗。\nDownload testcase failed."); }
                break;
        }
    }

    syncScroll(event: React.UIEvent<HTMLPreElement>) {
        const target = event.target as HTMLPreElement;
        if (target === undefined) return;
        if (this.state.selectedTab !== 1) return;
        const firstPre = this.ref1.current;
        const secondPre = this.ref2.current;
        if (!(firstPre && secondPre)) return;
        if (firstPre.contains(target)) {
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
}
