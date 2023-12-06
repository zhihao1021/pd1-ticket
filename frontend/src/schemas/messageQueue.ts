interface MessageQueueData {
    readonly level: "INFO" | "WARNING" | "ERROR",
    readonly message: string,
    readonly key: number,
    readonly timeout: number
}

export default MessageQueueData
