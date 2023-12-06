import { UploadPageState } from "../../states";

import { Block, CppCodeBox, ToggleMenu } from "../../ui";

import "./index.scss";

export default class UploadPage extends UploadPageState {
    render():React.ReactNode {
        const {
            show
        } = this.props;
        const {
            selectedFiles,
            displayCode,
            previewIndex,
            formatCode
        } = this.state;

        return (
            <div id="uploadPage" className="page" data-show={show}>
                <Block title="Upload" full={false} className="upload">
                    <label
                        className="bt bt-select"
                    >
                        Select
                        <input
                            type="file"
                            onChange={this.selectFile}
                            accept=".c,.h"
                            multiple
                        />
                    </label>
                    <span className="message">{
                        selectedFiles.length === 0 ?
                        "No files are selected." :
                        selectedFiles.map(file => file.name).join(", ")
                    }</span>
                    <button className="bt bt-upload" onClick={this.uploadFile}>Upload</button>
                </Block>
                <Block title="Preview" full={false} className="preview">
                    <div className="buttonBar">
                        <button
                            className="bt bt-format"
                            onClick={() => {this.setState(state => ({formatCode: !state.formatCode}))}}
                        >{formatCode ? "Unformat" : "Format"}</button>
                        <ToggleMenu
                            options={selectedFiles.map(file => file.name)}
                            selected={previewIndex}
                            switchSelect={this.switchPreview}
                        />
                    </div>
                    <CppCodeBox code={displayCode} format={formatCode} />
                </Block>
            </div>
        );
    }
}
