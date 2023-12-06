import { SSHPageState } from "../../states";

import { Block } from "../../ui";

import "./index.scss";

export default class SSHPage extends SSHPageState {
    render(): React.ReactNode {
        const {
            show
        } = this.props;
        const {
            path,
            directoryArray,
            fileArray,
            selectedFileArray
        } = this.state;

        return (
            <div id="ssh" className="page" data-show={show}>
                <Block title="SSH Explorer">
                    <div className="info">*可以按住Shift或Ctrl以一次選取多個檔案。 Press shift or ctrl to select multiple files.</div>
                    <pre>
                        <div className="path">
                            <div>Path:</div>
                            <div>{path}</div>
                        </div>
                        <code className="directory fileBlock">
                            {directoryArray.map((v, index) => (
                                <div
                                    key={index}
                                    title={v}
                                    onClick={() => {this.enterDirectory(v);}}
                                >
                                    <span className="ms-o">folder_open</span>
                                    <span>{v}</span>
                                </div>
                            ))}
                        </code>
                        <code className="files fileBlock">
                            {fileArray.map((v, index) => (
                                <div
                                    key={index}
                                    title={v}
                                    onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                                        this.selectFile(v, event.shiftKey || event.ctrlKey);
                                    }}
                                    data-selected={selectedFileArray.includes(`${path}/${v}`)}
                                >
                                    <span className="ms-o">note</span>
                                    <span>{v}</span>
                                </div>
                            ))}
                        </code>
                    </pre>
                    <div className="buttonBar">
                        <button
                            className="bt bt-download"
                            onClick={() => {this.downloadFiles();}}
                        >Download</button>
                        <button
                            className="bt bt-pull"
                            onClick={() => {this.pullFiles();}}
                        >Pull</button>
                        <label className="bt bt-upload">
                            Upload
                            <input type="file" accept=".*" multiple onChange={this.uploadFiles} />
                        </label>
                        {/* <button className="bt bt-upload">Upload</button> */}
                        <button className="bt bt-edit">Edit</button>
                    </div>
                </Block>
            </div>
        );
    }
}
