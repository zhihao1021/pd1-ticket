import React from "react";

import "./index.scss";

type propsType = Readonly<{
    options: Array<string>,
    selected: number,
    switchSelect: (index: number) => void,
    rows?: number
}>;
type stateType = Readonly<{
    open: boolean
}>;

export default class ToggleMenu extends React.Component<propsType, stateType> {
    ref: React.RefObject<HTMLDivElement>
    constructor(props: propsType) {
        super(props);

        this.state = {
            open: false
        };

        this.ref = React.createRef();
    }

    componentDidMount(): void {
        document.addEventListener("click", (event: MouseEvent) => {
            const target = event.target;
            if (target === null) return;
            if (!this.ref.current?.contains(target as Node) && this.state.open)  {
                this.setState({open: false});
            }
        });
    }

    render(): React.ReactNode {
        const {
            options,
            selected,
            switchSelect,
            rows
        } = this.props;
        const {
            open,
        } = this.state;

        return (
            <div
                ref={this.ref}
                className="toggleMenu"
                onClick={() => {this.setState(state => ({open: !state.open}))}}
                style={{
                    "--rows": Math.min(rows ?? 3, options.length)
                } as React.CSSProperties}
                data-open={open}
            >
                <div className="mask">
                    <div className="selected">{options[selected]}</div>
                    {
                        options.map((value, index) => (
                            <div key={index} onClick={() => {switchSelect(index);}}>
                                {value}
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}
