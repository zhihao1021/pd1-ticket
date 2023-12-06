import { JudgePageState } from "../../states";

import { Block, ToggleMenu } from "../../ui";

import "./index.scss"

const Convert = require('ansi-to-html');
const convert = new Convert();

export default class JudgePage extends JudgePageState {
    render(): React.ReactNode {
        const {
            show
        } = this.props;
        const {
            selectedTab,
            output,
            testcaseName,
            selectedTestcase,
            testcase,
            answer,
            userOutput,
            dirPath,
        } = this.state;

        let box1, box2, title1, title2, line1, line2;
        switch(selectedTab) {
            case 0:
                box1 = <code dangerouslySetInnerHTML={{__html: convert.toHtml(output)}} />;
                title1 = "Output"
                line1 = undefined
                box2 = undefined;
                title2 = undefined;
                line2 = undefined
                break;
            case 1:
                box1 = <code>{answer[selectedTestcase]}</code>;
                title1 = "Answer"
                line1 = <code className="lineN">
                {answer[selectedTestcase].split("\n").map((v, index) => {
                    return <div key={index} data-diff={answer[selectedTestcase][index] !== userOutput[selectedTestcase][index]}>{index+1}</div>
                })}
                </code>
                box2 = <code>{userOutput[selectedTestcase]}</code>;
                title2 = "Your Output"
                line2 = <code className="lineN">
                {userOutput[selectedTestcase].split("\n").map((v, index) => {
                        return <div key={index} data-diff={answer[selectedTestcase][index] !== userOutput[selectedTestcase][index]}>{index+1}</div>
                    })}
                </code>
                break;
            case 2:
                box1 = <code>{testcase[selectedTestcase]}</code>;
                title1 = "Testcase";
                line1 =  <code className="lineN">
                {testcase[selectedTestcase].split("\n").map((v, index) => {
                    return <div key={index}>{index+1}</div>
                })}
                </code>
                box2 = undefined;
                title2 = undefined;
                line2 = undefined;
                break;
        }

        return (
            <div id="judge" className="page" data-show={show}>
                <Block title="Result" className="result">
                    <div className="info">
                        <span>Path: {dirPath}</span>
                        <ToggleMenu options={["Output", "Diff", "Testcase"]} selected={selectedTab} switchSelect={this.switchSelectedTab}/>
                        <ToggleMenu options={testcaseName} selected={selectedTestcase} switchSelect={this.switchSelectedTestcase}/>
                    </div>
                    <div className="codeBlock">
                        <div className="resultBox fir">
                            <div className="title">{title1}</div>
                            <pre ref={this.ref1} onScroll={this.syncScroll.bind(this)}>
                                {line1}
                                {box1}
                            </pre>
                            <div className="buttonBar">
                                <button className="bt bt-copy" onClick={() => {this.copy(0);}}>Copy</button>
                                <button className="bt bt-download" onClick={() => {this.download(0);}}>Download</button>
                            </div>
                        </div>
                        <div className="resultBox sec" data-show={selectedTab === 1}>
                            <div className="title">{title2}</div>
                            <pre ref={this.ref2} onScroll={this.syncScroll.bind(this)}>
                                {line2}
                                {box2}
                            </pre>
                            <div className="buttonBar">
                                <button className="bt bt-copy" onClick={() => {this.copy(1);}}>Copy</button>
                                <button className="bt bt-download" onClick={() => {this.download(1);}}>Download</button>
                            </div>
                        </div>
                    </div>
                </Block>
            </div>
        );
    }
}
