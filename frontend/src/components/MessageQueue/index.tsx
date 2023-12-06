import { MessageQueueState } from "../../states";

import MessageBox from "./messageBox";

import "./index.scss";

export default class MessageQueue extends MessageQueueState {
    render(): React.ReactNode {
        const {
            messageQueue
        } = this.props;

        return (
            <div id="messageQueue">
                {messageQueue.map(data => (
                    <MessageBox
                        key={data.key}
                        data={data}
                    />
                ))}
            </div>
        )
    }
}
