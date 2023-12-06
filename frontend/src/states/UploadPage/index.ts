import React from "react";

import { addTicket } from "../../api/ticket";
import { addMessage, switchLoading, changeShowTicket, switchPage } from "../../publicFunction";


type propsType = Readonly<{
    show: boolean
}>;
type stateType = Readonly<{
    selectedFiles: Array<File>,
    previewIndex: number,
    displayCode: string,
    formatCode: boolean
}>;

export default class UploadPageState extends React.Component<propsType, stateType> {
    constructor(props: propsType) {
        super(props);

        this.state = {
            selectedFiles: [],
            previewIndex: 0,
            displayCode: "",
            formatCode: false
        }

        this.selectFile = this.selectFile.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.switchPreview = this.switchPreview.bind(this);
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        const {
            selectedFiles,
            previewIndex
        } = this.state;
        const different = selectedFiles.filter(file => !prevState.selectedFiles.includes(file));
        if (prevState.previewIndex !== previewIndex ||
            different.length !== 0 ||
            selectedFiles.length !== prevState.selectedFiles.length
        ) {
            const file = selectedFiles[previewIndex];
            if (file) {
                selectedFiles[previewIndex].text().then((response) => {
                    this.setState({displayCode: response});
                }).catch(() => {
                    this.setState({displayCode: ""});
                });
            }
            else {
                this.setState({displayCode: ""});
            }
        }
    }

    selectFile(event: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (!files) return;
        this.setState({
            selectedFiles: files,
            previewIndex: 0,
        });
    }

    uploadFile() {
        const { selectedFiles } = this.state;
        if (selectedFiles.length === 0) {
            addMessage("WARNING", "未選擇檔案。\nNo selected files.")
            return;
        }
        switchLoading(true);
        addTicket(selectedFiles).then(ticket => {
            addMessage("INFO", "上傳成功。\nUpload success.");
            changeShowTicket(ticket);
        }).catch(() => {
            addMessage("ERROR", "上傳失敗。\nUpload failed.");
        }).finally(() => {
            switchLoading(false);
            this.setState({
                selectedFiles: [],
                displayCode: "",
                previewIndex: 0,
            });
        })
    }

    switchPreview(index: number) {
        this.setState({
            previewIndex: index
        });
    }
}
