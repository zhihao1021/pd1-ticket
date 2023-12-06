import { CodePageState } from "../../states";

import { Block, CppCodeBox, ToggleMenu, PopupBox } from "../../ui";

import "./index.scss";

export default class CodePage extends CodePageState {
    render():React.ReactNode {
        const {
            show,
            ticket
        } = this.props;
        const {
            formatCode,
            fileList,
            codeList,
            selectFile,
            uploadDirectory,
            popupShow,
            popupMessage,
            popupOK,
            judgeList,
            selectedJudge,
        } = this.state;

        return (
            <div id="codePage" className="page" data-show={show}>
                <Block title="Info" full={false} className="info">
                    <div className="ticketId">
                        <span className="key">Ticket ID</span>
                        <span className="value">{ticket}</span>
                    </div>
                    <div className="buttonBar">
                        <button className="bt bt-share" onClick={this.copyLink}>Share</button>
                        <button className="bt bt-download-sec" onClick={this.downloadAll}>Download All</button>
                        <button className="bt bt-judge" onClick={this.judge}>Judge</button>
                        <div className="uploadBlock">
                            <input
                                placeholder="Directory"
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    this.setState({uploadDirectory: event.target.value});
                                }}
                                value={uploadDirectory}
                            />
                            <button className="bt bt-upload" onClick={this.upload}>Upload</button>
                        </div>
                    </div>
                </Block>
                <Block title="Preview" full={false} className="preview">
                    <div className="buttonBar">
                        <button
                            className="bt bt-format"
                            onClick={() => {this.setState(state => ({formatCode: !state.formatCode}))}}
                        >{formatCode ? "Unformat" : "Format"}</button>
                        <button
                            className="bt bt-download"
                            onClick={this.download}
                        >Download</button>
                        <button
                            className="bt bt-copy"
                            onClick={this.copy}
                        >Copy</button>
                        <ToggleMenu
                            options={fileList}
                            selected={selectFile}
                            switchSelect={this.selectFile}
                        />
                    </div>
                    <CppCodeBox code={codeList[selectFile] ?? ""} format={formatCode} />
                </Block>
                <PopupBox
                    show={popupShow}
                    message={popupMessage}
                    ok={popupOK}
                    close={() => {this.setState({popupShow: false, popupOK: undefined})}}
                >
                    <ToggleMenu options={judgeList} selected={selectedJudge} switchSelect={this.swithcJudge} />
                </PopupBox>
            </div>
        );
    }
}
