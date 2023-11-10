import React from "react";

import "./index.scss";

type propsType = Readonly<{
    value: number,
    options: Array<string>,
    changeValue: (value: number) => void
    displayRow?: number,
}>;
type stateType = Readonly<{
    open: boolean
}>;

export default class Selection extends React.Component<propsType, stateType> {
    constructor(props: propsType) {
        super(props);

        this.state = {
            open: false
        };
    }

    render(): React.ReactNode {
        const {
            value,
            options,
            changeValue,
            displayRow
        } = this.props;
        const {
            open
        } = this.state;

        const maxLength = Math.max(...options.map(s => s.length));

        const styleDict: {
            [key: string]: any
        } = {
            "--font-num": maxLength
        };
        if (displayRow) {
            styleDict["--row"] = displayRow
        }

        return (
            <div className={`selection${open ? " open" : ""}`} style={styleDict as React.CSSProperties}>
                <div className="select" onClick={() => {
                    this.setState(state => {
                        return {
                            open: !state.open
                        }
                    });
                }}>{options[value]}</div>
                <div className="options">
                    {
                        options.map((str, index) => {
                            return <div key={index} onClick={() => {
                                changeValue(index);
                                this.setState({open: false});
                            }}>{str}</div>;
                        }) 
                    }
                </div>
            </div>
        )
    }
}
