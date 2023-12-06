import { SideBarState } from "../../states";

import { pages } from "../../schemas/pages";

import { switchPage } from "../../publicFunction";

import "./index.scss";

export default class SideBar extends SideBarState {
    render(): React.ReactNode {
        const {
            logined,
            username,
            selectPage,
            switchTheme
        } = this.props;
        const {
            display
        } = this.state;

        return (
            <div ref={this.ref} id="sideBar" data-show={logined && display}>
                {logined ? <div className="switchButton" onClick={this.switchDisplay} /> : undefined}
                <div className="entity">
                    <div className="head">{`Welcome, ${username}.`}</div>
                    <div
                        className="body"
                        onClick={() => switchPage(pages[0])}
                        data-select={selectPage === pages[0]}
                    >{"公告\nAnnouncement"}</div>
                    <div
                        className="body"
                        onClick={() => switchPage(pages[1])}
                        data-select={selectPage === pages[1]}
                    >{"Ticket 列表\nTicket List"}</div>
                    <div
                        className="body"
                        onClick={() => switchPage(pages[2])}
                        data-select={selectPage === pages[2]}
                    >{"新增 Ticket\nAdd Ticket"}</div>
                    <div
                        className="body"
                        onClick={() => switchPage(pages[3])}
                        data-select={selectPage === pages[3]}
                    >{"程式碼\nCode Block"}</div>
                    <div
                        className="body"
                        onClick={() => switchPage(pages[4])}
                        data-select={selectPage === pages[4]}
                    >{"測試結果\nJudge Result"}</div>
                    <div
                        className="body"
                        onClick={() => switchPage(pages[5])}
                        data-select={selectPage === pages[5]}
                    >{"SSH 檔案總管\nSSH Explorer"}</div>
                    <div
                        className="body"
                        onClick={() => switchPage(pages[6])}
                        data-select={selectPage === pages[6]}
                    >{"文字編輯器\nText Editor"}</div>
                    <div
                        className="tail"
                        onClick={this.logout}
                    >{"登出\nLogout"}</div>
                    {logined ? <div className="themeButton" onClick={switchTheme} /> : undefined}
                </div>
            </div>
        )
    }
}
