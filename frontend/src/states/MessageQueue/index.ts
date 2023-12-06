import React from "react";

import MessageQueueData from "../../schemas/messageQueue";

type propsType = Readonly<{
    messageQueue: Array<MessageQueueData>,
}>;
type stateType = Readonly<{}>;

export default class MessageQueueState extends React.Component<propsType, stateType> {}
