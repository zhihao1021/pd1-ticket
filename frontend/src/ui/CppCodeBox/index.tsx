import React from "react";
import hljs from "highlight.js/lib/core";
import c from "highlight.js/lib/languages/cpp";
import { formatCode } from "../../utils";

// import "highlight.js/styles/atom-one-dark.min.css";
// import "highlight.js/styles/atom-one-light.min.css";

import "./index.scss";

hljs.registerLanguage("c", c);

type propsType = Readonly<{
    code: string,
    format: boolean,
}>;
type stateType = Readonly<{
    formattedCode: string,
}>;

export default class CppCodeBox extends React.Component<propsType, stateType> {
    constructor(props: propsType) {
        super(props);

        this.state = {
            formattedCode: props.code,
        };
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        const {
            code
        } = this.props;

        if (code !== prevProps.code) {
            this.#updateFormatCode();
        }
    }

    #updateFormatCode() {
        const { code } = this.props;
        this.setState({formattedCode: formatCode(code)});
    }
    
    render(): React.ReactNode {
        const {
            code,
            format
        } = this.props;
        const {
            formattedCode,
        } = this.state;

        const displayCode = format ? formattedCode : code;

        return (
            <pre className="cppCodeBox">
                {
                    displayCode === "" ? <div className="empty">
                        No Content.
                    </div> : undefined
                }
                {
                    displayCode === "" ? undefined :
                    <code className="lineN">
                        {displayCode.split("\n").map((v, index) => (
                            <div key={index}>{index+1}</div>
                        ))}
                    </code>
                }
                {
                    displayCode === "" ? undefined :
                    <code dangerouslySetInnerHTML={{
                        __html: hljs.highlight(displayCode, {language: "c"}).value
                    }} />
                }
            </pre>
        );
    }

}
