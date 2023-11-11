import axios from "axios";
import React from "react";

import Selection from "../Selection";

import InfoBox from "./InfoBox";
import JudgeBox from "./JudgeBox";
import CodeBox from "./CodeBox";

import { apiEndPoint } from "../config";

import "./index.scss";

type propsType = Readonly<{
    login: boolean,
    show: boolean,
    hash: string,
    switchLoading: (status?: boolean) => void,
}>;
type stateType = Readonly<{
    code: string | null,
    message: string,
    uploadDirPath: string,
    uploadFileName: string,
    fileName: string,
    showJudge: boolean,
    judgeContext: string,
    judgeOption: number,
    judgeList: Array<string>
}>;

export default class CodePage extends React.Component<propsType, stateType> {
    constructor(props: propsType) {
        super(props);

        this.state = {
            code: null,
            message: "",
            uploadDirPath: "",
            uploadFileName: "",
            fileName: "",
            showJudge: false,
            judgeContext: "",
            judgeOption: 0,
            judgeList: [],
        };

        this.uploadTicket = this.uploadTicket.bind(this);

        this.judge = this.judge.bind(this);
        this.switchJudge = this.switchJudge.bind(this);
        this.changeJudgeOption = this.changeJudgeOption.bind(this);
    }

    componentDidMount(): void {
        if (this.props.login) {
            this.getTicket();
        }
        this.getJudgeOptions();
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        const {
            hash,
            login
        } = this.props;
        const prevHash = prevProps.hash;
        const prevLogin = prevProps.login;
        if (hash === null || hash === "") {
            if (this.state.showJudge === true || this.state.judgeContext !== "") {
                this.setState({
                    showJudge: false,
                    judgeContext: ""
                })
            }
        }
        else if (hash !== prevHash || (login && !prevLogin)) {
            this.setState({
                message: "",
                showJudge: false,
                judgeContext: ""
            })
            this.getTicket();
        }
    }

    switchJudge(status?: boolean) {
        this.setState((state)=> {
            return {
                showJudge: status === undefined ? !state.showJudge : status
            };
        });
    }

    changeJudgeOption(value: number) {
        this.setState({judgeOption: value});
    }

    onInputChange(field: string) {
        const __func = (ev: React.ChangeEvent) => {
            let target = ev.target as HTMLInputElement;
            let value = target.value;
            this.setState((state) => {
                let newState = state as {[key: string]: any};
                newState[field] = value;
                return newState as stateType;
            });
        };
        return __func.bind(this);
    }

    getJudgeOptions() {
        axios.get(
            `${apiEndPoint}/judge`
        ).then(
            (response) => {
                this.setState({
                    judgeList: response.data
                });
            }
        )
    }

    getTicket() {
        const {hash} = this.props;
        if (hash === null || hash === "") return;
        this.props.switchLoading(true);
        axios.get(
            `${apiEndPoint}/ticket/${hash}`,
        ).then((response) => {
            const filePrefix = `${hash.split("-", 2).join("-")}-`;
            this.setState({
                code: response.data,
                fileName: hash.replace(filePrefix, ""),
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
        if (hash === null) return;
        const {
            uploadDirPath,
            uploadFileName
        } = this.state;
        this.props.switchLoading(true);
        axios.postForm(
            `${apiEndPoint}/upload`,
            {
                ticket_id: hash,
                dir_path: uploadDirPath,
                filename: uploadFileName
            }
        ).then((response) => {
            this.setState({message: `上傳成功: ~/${response.data}`,});
        }).catch(() => {
            this.setState({message: "上傳失敗",});
        }).finally(() => {
            this.props.switchLoading(false);
        })
    }

    judge() {
        const {hash} = this.props;
        const {
            judgeOption,
            judgeList
        } = this.state;
        if (hash === null) return;
        const command = judgeList[judgeOption];
        if (command === null) {
            this.setState({
                message: "測試失敗"
            })
            return;
        }
        this.props.switchLoading(true);
        axios.get(
            `${apiEndPoint}/judge/${hash}?command=${command}`,
        ).then((response) => {
            this.setState({
                judgeContext: response.data,
                showJudge: true
            })
        }).catch(() => {
            this.setState({
                message: "測試失敗"
            })
        }).finally(() => {
            this.props.switchLoading(false);
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
            message,
            uploadDirPath,
            uploadFileName,
            fileName,
            showJudge,
            judgeContext,
            judgeOption,
            judgeList
        } = this.state;

        let fileDateTime = hash?.split("-", 2)[1];
        fileDateTime = fileDateTime?.replace(
            "T", " "
        ).replaceAll("_", "/").replaceAll(".", ":");
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
                    <InfoBox title="Ticket ID" className="ticketId" context={hash} />
                    <div className="buttonBar">
                        <div className="judge" onClick={this.judge}>Judge</div>
                        <Selection
                            value={judgeOption}
                            options={judgeList}
                            changeValue={this.changeJudgeOption}
                            displayRow={3}
                        />
                        <div className="message">{message}</div>
                        <input
                            className="path"
                            placeholder="Path"
                            value={uploadDirPath}
                            onChange={this.onInputChange("uploadDirPath")}
                        />
                        <input
                            className="filename"
                            placeholder="Filename"
                            value={uploadFileName}
                            onChange={this.onInputChange("uploadFileName")}
                        />
                        <div className="upload" onClick={this.uploadTicket}>Upload</div>
                    </div>
                </div>
                <CodeBox
                    hash={hash}
                    code={code}
                    fileName={fileName}
                />
                <JudgeBox
                    show={showJudge}
                    context={judgeContext}
                    switchJudge={this.switchJudge}
                 />
            </div>
        )
    }
}
