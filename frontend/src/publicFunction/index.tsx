import { pageType } from "../schemas/pages";
import JudgeResult from "../schemas/judgeResult";

const functionData: {[key: string]: Function} = {};

const switchLoading = (status: boolean) => {
    return functionData["switchLoading"](status);
}

const switchPage = (page: pageType) => {
    return functionData["switchPage"](page);
}

const addMessage = (
    level: "INFO" | "WARNING" | "ERROR",
    message: string
) => {
    return functionData["addMessage"](level, message);
}

const changeShowTicket = (ticket: string) => {
    return functionData["changeShowTicket"](ticket);
}

const updateTicket = () => {
    return functionData["updateTicket"]();
}

const changeShowJudge = (judgeResult: JudgeResult) => {
    return functionData["changeShowJudge"](judgeResult);
}

export {
    functionData,
    switchLoading,
    switchPage,
    addMessage,
    changeShowTicket,
    updateTicket,
    changeShowJudge,
};
