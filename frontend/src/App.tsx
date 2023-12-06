import React from "react";
import jwtDecode from "jwt-decode";

import {
    AnnouncementPage,
    CodePage,
    JudgePage,
    Loading,
    LoginPage,
    MessageQueue,
    SideBar,
    SSHPage,
    TicketPage,
    UploadPage,
} from "./components";

import MessageQueueData from "./schemas/messageQueue";
import { pageType, pages } from "./schemas/pages";

import { setting } from "./utils";
import { functionData } from "./publicFunction";

import "./App.scss";

type propsType = Readonly<{}>;
type stateType = Readonly<{
    loading: boolean, // 切換載入頁面
    logined: boolean, // 是否已經登入
    messageQueue: Array<MessageQueueData>, // 訊息列表
    username: string, // 使用者名稱
    showPage: pageType, // 當前顯示頁面
    showTicket: string | undefined, // 顯示的Ticket
    theme: "dark" | "light", // 主題色
}>;

export default class App extends React.Component<propsType, stateType> {
    changeShowTicket: (ticket: string) => void
    loadingCount: number
    constructor(props: propsType) {
        super(props);

        let nowShowPage = setting("lastPage", "ticket", "read") ?? "ticket";
        if (!pages.includes(nowShowPage)) nowShowPage = "ticket"

        let username = "";
        try {
            username = (jwtDecode(localStorage.getItem("access_token") ?? "") as {
                username: string, password: string, admin: boolean
            }).username;
        } catch {
            localStorage.removeItem("access_token");
            username = "";
        }

        let theme = setting("theme", "dark", "read");
        if (!["light", "dark"].includes(theme)) theme = "dark";

        this.state = {
            loading: false,
            logined: localStorage.getItem("access_token") !== null,
            messageQueue: [],
            username: username,
            showPage: nowShowPage,
            showTicket: undefined,
            theme: theme,
        };

        this.loadingCount = 0;

        this.changeShowTicket = (ticket: string) => {
            setting("lastTicket", ticket, "write");
            this.setState({ showPage: "code", showTicket: ticket });
        }

        this.switchLoading = this.switchLoading.bind(this);
        this.switchPage = this.switchPage.bind(this);
        this.addMessage = this.addMessage.bind(this);
        this.changeShowTicket = this.changeShowTicket.bind(this);

        functionData["switchLoading"] = this.switchLoading;
        functionData["switchPage"] = this.switchPage;
        functionData["addMessage"] = this.addMessage;
        functionData["changeShowTicket"] = this.changeShowTicket;
    }

    componentDidMount(): void {
        const lastTicket = setting("lastTicket");
        // 檢查是否有"上次存取"的Ticket
        if (lastTicket !== undefined) {
            this.setState({
                showTicket: lastTicket,
            });
        }
        this.#checkHash();
        window.addEventListener("hashchange", this.#checkHash.bind(this));
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType): void {
        const {
            logined,
            showTicket,
            showPage
        } = this.state;
        if (!prevState.logined && logined) {
            const username = (jwtDecode(localStorage.getItem("access_token") ?? "") as {
                username: string, password: string, admin: boolean
            }).username;
            this.setState({ username: username });
        }

        if (showPage === "code" && showTicket !== prevState.showTicket) {
            window.location.hash = `${showPage}-${showTicket}`;
        }
    }

    #checkHash() {
        const rawHash = window.location.hash.replace("#", "");
        const hash = rawHash.split("-")[0];
        if ((pages as Array<string>).includes(hash)) {
            setting("lastPage", hash, "write");

            if (hash as pageType === "code") {
                if (rawHash.split("-").length > 1) {
                    const ticket = rawHash.replace("code-", "");
                    // this.changeShowTicket(ticket);
                    if (ticket !== this.state.showTicket) {
                        this.setState({showTicket: ticket});
                    }
                }
            }
            this.setState({ showPage: hash as pageType });
        }
    }

    // 切換Loading介面
    switchLoading(status?: boolean) {
        const { loading } = this.state;
        let newStatus: boolean;
        if (status === undefined) newStatus = !loading;
        else {
            this.loadingCount += status ? 1 : -1;
            newStatus = this.loadingCount > 0;
        }
        this.setState(state => ({
            loading: newStatus,
        }));
    }

    // 切換頁面
    switchPage(page: pageType) {
        const {showTicket} = this.state;
        window.location.hash = page === "code" && showTicket !== undefined ? `${page}-${showTicket}` : page;
    }

    // 新增訊息至訊息列
    addMessage(level: "INFO" | "WARNING" | "ERROR", message: string) {
        this.setState(state => {
            const originQueue = state.messageQueue;
            const key = originQueue.length === 0 ? 0 : originQueue[originQueue.length - 1].key + 1;
            originQueue.push({
                level: level,
                message: message,
                key: key,
                timeout: 7000
            });
            setTimeout(this.removeMessage.bind(this), 7000);
            return { messageQueue: originQueue };
        });
    }

    // 移除第一則訊息
    removeMessage() {
        this.setState(state => {
            const originQueue = state.messageQueue;
            originQueue.shift();
            return { messageQueue: originQueue };
        });
    }

    render(): React.ReactNode {
        const {
            loading,
            logined,
            messageQueue,
            username,
            showPage,
            theme,
            showTicket,
        } = this.state;

        return (
            <div id="app" data-theme={theme} data-login={logined}>
                <Loading show={loading} />
                <MessageQueue messageQueue={messageQueue} />
                <SideBar
                    logined={logined}
                    username={username}
                    selectPage={showPage}
                    switchTheme={() => {
                        this.setState(state => {
                            const theme = state.theme === "dark" ? "light" : "dark";
                            setting("theme", theme, "write");
                            return {
                                theme: theme,
                            };
                        });
                    }}
                />
                <LoginPage
                    logined={logined}
                    callback={() => { this.setState({ logined: true }) }}
                />
                <AnnouncementPage show={logined&&showPage==="announcement"} />
                <TicketPage show={logined&&showPage==="ticket"} />
                <UploadPage show={logined&&showPage==="upload"} />
                <CodePage show={logined&&showPage==="code"} ticket={showTicket} />
                <JudgePage show={logined&&showPage==="judge"}/>
                <SSHPage show={logined&&showPage==="ssh"} />
            </div>
        )
    }
}
