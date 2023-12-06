import { ReactNode } from "react";
import MessageBoxState from "../../states/MessageQueue/messageBox";

export default class MessageBox extends MessageBoxState {
    render(): ReactNode {
        const {
            data
        } = this.props;
        const {
            height
        } = this.state;

        return (
            <div
                ref={this.ref}
                className="messageBox"
                data-level={data.level}
                style={{
                    "--delay": data.timeout,
                    "--height": height ? `${height}px` : "auto"
                } as React.CSSProperties}
            >
                <p>
                    {data.message}
                </p>
            </div>
        );
    }
}
