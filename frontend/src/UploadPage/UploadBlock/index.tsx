import React from "react";

import "./index.scss";

type propsType = Readonly<{
    selectFile: (event: React.ChangeEvent<HTMLInputElement>) => void,
    sendFile: () => void,
    switchExplorer: (status?: boolean) => void,
    selectedFiles: FileList | null,
    uploadMessage: string,
}>;

export default function UploadBlock(props: propsType): React.ReactElement {
    const {
        selectFile,
        sendFile,
        switchExplorer,
        selectedFiles,
        uploadMessage
    } = props;
    const displayFileString = selectedFiles !== null && selectedFiles?.length !== 0;
    let fileString = "";
    if (selectedFiles !== null) {
        for (let i=0; i < selectedFiles.length; i++) {
            fileString += selectedFiles[i].name;
            if (i !== selectedFiles.length - 1) fileString += ", ";
        }
    }
    return (
        <div className="uploadBlock block buttonBar">
            <h2>Upload File</h2>
            <div className="server button" onClick={() => {switchExplorer(true)}}>Pull File</div>
            <label className="uploadButton">
                <div className="button selectFile">Select File</div>
                <input
                    type="file"
                    onChange={selectFile}
                    accept=".c,.h"
                    multiple={true}
                />
            </label>
            <div className="filename">{displayFileString ? fileString : "No selected file"}</div>
            <div className="message">{uploadMessage}</div>
            <div className="submit button" onClick={sendFile}>Submit</div>
        </div>
    );
}
