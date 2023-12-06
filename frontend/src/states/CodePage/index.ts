import React from "react";

import {
    getJudgeList,
    getJudgeResult,
} from "../../api/judge";
import {
    getTicketFiles,
    getFileContext,
    downloadTicket,
    uploadTicket,
} from "../../api/ticket";
import {
    switchLoading,
    addMessage,
    changeShowJudge,
    switchPage,
} from "../../publicFunction";
import {
    downloadBlob,
    copy,
    formatCode as format,
    setting,
} from "../../utils";

type propsType = Readonly<{
    show: boolean,
    ticket?: string,
}>;
type stateType = Readonly<{
    formatCode: boolean
    fileList: Array<string>,
    codeList: Array<string>,
    selectFile: number,
    uploadDirectory: string,
    judgeList: Array<string>,
    selectedJudge: number,
    popupShow: boolean,
    popupMessage: string,
    popupOK: Function|undefined,
    popupCancel: Function|undefined,
}>;

export default class CodePageState extends React.Component<propsType, stateType> {
    loaded: boolean
    constructor(props: propsType) {
        super(props);

        this.state = {
            formatCode: false,
            fileList: [],
            codeList: [],
            selectFile: 0,
            uploadDirectory: "",
            judgeList: [],
            selectedJudge: setting("selectedJudge", 0, "read"),
            popupShow: false,
            popupMessage: "",
            popupOK: undefined,
            popupCancel: undefined,
        };

        this.loaded = false;

        this.selectFile = this.selectFile.bind(this);
        this.copyLink = this.copyLink.bind(this);
        this.downloadAll = this.downloadAll.bind(this);
        this.download = this.download.bind(this);
        this.copy = this.copy.bind(this);
        this.upload = this.upload.bind(this);
        this.swithcJudge = this.swithcJudge.bind(this);
        this.judge = this.judge.bind(this);
    }

    componentDidMount(): void {
        const {show} = this.props;
        if (show) {
            this.#updateCode();
            this.loaded = true;
        }
        getJudgeList().then((judgeList) => {
            this.setState({
                judgeList: judgeList
            });
        })
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        const {
            show, 
            ticket
        } = this.props;
        if ((ticket !== prevProps.ticket && show) || (!prevProps.show && show && !this.loaded)) {
            this.#updateCode();
            this.loaded = true;
        }
    }

    #updateCode() {
        const {
            ticket,
            show,
        } = this.props;
        if (ticket === undefined) {
            this.setState({
                fileList: [],
                codeList: [],
                selectFile: 0,
            });
            return;
        }
        switchLoading(true);
        getTicketFiles(ticket).then(async (fileList) => {
            const codeList = await Promise.all(fileList.map(async (filename) => {
                try {
                    return await getFileContext(ticket, filename);
                }
                catch {
                    return "";
                }
            }));

            this.setState({
                fileList: fileList,
                codeList: codeList,
                selectFile: 0,
            })
        }).catch(() => {
            if (show) {
                addMessage("ERROR", "資料讀取失敗。\nFail to read data.")
            }
            this.setState({
                fileList: [],
                codeList: [],
                selectFile: 0,
            })
        }).finally(() => {
            switchLoading(false);
        })
    }

    selectFile(index: number) {
        this.setState({selectFile: index});
    }

    copyLink() {
        copy(window.location.href).then(() => {
            addMessage("INFO", "連結複製成功。\nCopy link success.");
        }).catch(() => {
            addMessage("ERROR", "連結複製失敗。\nCopy link failed.");
        })
    }

    downloadAll() {
        const {ticket} = this.props;
        if (ticket === undefined) return;
        downloadTicket(ticket).then((ticketFile) => {
            downloadBlob(ticketFile, `${ticket}.zip`);
            addMessage("INFO", "下載成功。\nDownload success.");
        }).catch(() => {
            addMessage("ERROR", "下載失敗。\nDownload failed.");
        });
    }

    copy() {
        const {
            codeList,
            selectFile,
            formatCode
        } = this.state;

        const code = formatCode ? format(codeList[selectFile]) : codeList[selectFile];

        copy(code).then(() => {
            addMessage("INFO", "程式碼複製成功。\nCopy code success.");
        }).catch(() => {
            addMessage("ERROR", "程式碼複製失敗。\nCopy code failed.");
        })
    }

    download() {
        const {
            codeList,
            fileList,
            selectFile,
            formatCode
        } = this.state;

        const code = formatCode ? format(codeList[selectFile]) : codeList[selectFile];

        try {
            downloadBlob(new Blob([code]), `${fileList[selectFile]}`);
            addMessage("INFO", "下載成功。\nDownload success.");
        } catch {
            addMessage("ERROR", "下載失敗。\nDownload failed.");
        }
    }

    upload() {
        const {ticket} = this.props;
        const {
            uploadDirectory,
            formatCode,
        } = this.state;
        if (ticket === undefined) {
            addMessage("ERROR", "上傳失敗。\nUpload failed.")
            return;
        }
        switchLoading(true);
        uploadTicket(ticket, uploadDirectory, formatCode).then(path => {
            addMessage("INFO", `上傳成功: ${path}\nUpload success: ${path}`)
        }).catch(() => {
            addMessage("ERROR", "上傳失敗。\nUpload failed.")
        }).finally(() => {
            switchLoading(false);
            this.setState({uploadDirectory: ""});
        })
    }

    swithcJudge(index: number) {
        this.setState({
            selectedJudge: index,
        });
        setting("selectedJudge", index, "write")
    }

    judge() {
        const {ticket} = this.props;
        if (!ticket) return;
        this.setState({
            popupShow: true,
            popupMessage: "選擇指令 Select Command:",
            popupOK: () => {
                const {
                    judgeList,
                    selectedJudge
                } = this.state
                switchLoading(true);
                getJudgeResult(ticket, judgeList[selectedJudge]).then((judgeResult) => {
                    addMessage("INFO", "測試成功。\nJudge success.")
                    changeShowJudge(judgeResult);
                    switchPage("judge");
                }).catch(() => {
                    addMessage("ERROR", "測試失敗。\nJudge failed.")
                }).finally(() => {
                    switchLoading(false);
                })
            }
        })
    }
}
