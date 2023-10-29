import React from "react";

import "./index.scss";

type propsType = Readonly<{
    selectFile: (event: React.ChangeEvent<HTMLInputElement>) => void,
    sendFile: () => void,
    switchExplorer: (status?: boolean) => void,
    selectedFile: File | null,
    uploadMessage: string,
}>;

export default function UploadBlock(props: propsType): React.ReactElement {
    const {
        selectFile,
        sendFile,
        switchExplorer,
        selectedFile,
        uploadMessage
    } = props;
    return (
        <div className="uploadBlock block">
            <h2>Upload File</h2>
            <div className="server button" onClick={() => {switchExplorer(true)}}>從伺服器選擇</div>
            <label className="uploadButton">
                <div className="button">選擇檔案</div>
                <input
                    type="file"
                    onChange={selectFile}
                    accept=".c"
                />
            </label>
            <div className="filename">{selectedFile?.name ?? "尚未選擇檔案"}</div>
            <div className="message">{uploadMessage}</div>
            <div className="submit button" onClick={sendFile}>上傳檔案</div>
        </div>
    );
}
