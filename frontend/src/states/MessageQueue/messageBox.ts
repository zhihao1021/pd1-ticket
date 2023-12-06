import React from "react";

import MessageQueueData from "../../schemas/messageQueue";

type propsType = Readonly<{
    data: MessageQueueData
}>;
type stateType = Readonly<{
    height: number | undefined
}>;

export default class MessageBoxState extends React.Component<propsType, stateType> {
    ref: React.RefObject<HTMLDivElement>
    constructor(props: propsType) {
        super(props);

        this.state = {
            height: undefined
        };

        this.ref = React.createRef();
    }

    #checkHeight() {
        const ref = this.ref;
        if (ref.current === null) {
            setTimeout(this.#checkHeight.bind(this), 50);
            return;
        }

        this.setState({
            height: Math.floor(ref.current.clientHeight)
        });
    }

    componentDidMount(): void {
        this.#checkHeight();
    }
}
