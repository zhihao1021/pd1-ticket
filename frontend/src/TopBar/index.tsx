import axios from "axios";
import React from "react";

import { apiEndPoint } from "../config";

import "./index.scss";

type  propsType = Readonly<{
    show: boolean,
    username: string,
    logout: () => void,
    readAnnc: () => void;
}>;
type  stateType = Readonly<{
    showAnnouncement: boolean,
    announcements?: {
        readonly: Array<string>,
        data: Array<string>,
    },
    dontShowValue: boolean,
    closeButtonText: string,
    closeButtonOnClick?: () => void,
    onScroll?: () => void,
}>;

export default class TopBar extends React.Component<propsType, stateType> {
    constructor(props: propsType) {
        super(props);

        const dont_show_annc = localStorage.getItem("dontShowAnnc") === "true" ?? false;
        this.state = {
            showAnnouncement: false,
            dontShowValue: dont_show_annc,
            closeButtonText: "Scroll Down",
            onScroll: this.onScrollToEnd.bind(this)
        };

        this.closeButtonClick = this.closeButtonClick.bind(this);
    }

    componentDidMount(): void {
        axios.get(`${apiEndPoint}/announce`).then(
            (response) => {
                const old_annc_string = localStorage.getItem("announcement");
                const new_annc = response.data
                const new_annc_string = JSON.stringify(new_annc);
                const dont_show_annc = localStorage.getItem("dontShowAnnc") === "true" ?? false;

                const agree = localStorage.getItem("readedAnnc") === "true" ?? false;
                const needShow = old_annc_string !== new_annc_string || !agree;
                const show = !(dont_show_annc) || needShow || !agree;

                if (needShow) {
                    if (agree) {
                        localStorage.setItem("readedAnnc", "false");
                    }
                }
                else {
                    this.props.readAnnc();
                    this.setState({
                        onScroll: undefined,
                        closeButtonText: "Close",
                        closeButtonOnClick: () => {this.closeButtonClick()}
                    });
                }

                this.setState({
                    showAnnouncement: show,
                    announcements: new_annc
                });
                localStorage.setItem("announcement", new_annc_string);
            }
        );
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType) {
        const {
            announcements,
            onScroll
        } = this.state;
        if (prevState.announcements === undefined && announcements !== undefined && onScroll) {
            onScroll();
        }
    }


    switchAnnc(status: boolean) {
        this.setState({
            showAnnouncement: status,
        });
        if (status === false) {
            localStorage.setItem("dontShowAnnc", this.state.dontShowValue ? "true" : "false");
        }
    }

    onScrollToEnd(event?: Event) {
        const Element: HTMLUListElement | null = (event?.target ?? document.querySelector("#topBar div.announcement ul")) as HTMLUListElement;
        if (Element === null) return;
        if (!this.props.show) {
            if (event === undefined) {
                setTimeout(this.onScrollToEnd.bind(this), 100);
            }
            return;
        };

        if (Math.abs(Element.scrollHeight - (Element.scrollTop + Element.clientHeight)) < 1) {
            this.startCountDown();
            this.setState({
                onScroll: undefined
            });
        }

    }

    closeButtonClick() {
        this.switchAnnc(false);
        this.props.readAnnc();
        localStorage.setItem("readedAnnc", "true");
    }

    startCountDown() {
        const change = (i: number) => {
            if (i === 0) {
                this.setState({
                    closeButtonText: "Close",
                    closeButtonOnClick: () => {this.closeButtonClick()}
                })
                return;
            }
            this.setState({
                closeButtonText: `${i}`
            })
            setTimeout(change, 1000, i-1);
        }
        change(5);
    }

    render(): React.ReactNode {
        const {
            show,
            username,
            logout
        } = this.props;
        const {
            showAnnouncement,
            dontShowValue,
            closeButtonText,
            closeButtonOnClick,
            onScroll,
        } = this.state;
        const {
            readonly,
            data
        } = this.state.announcements ?? {}
        return (
            <div id="topBar" className={show ? "show" : undefined}>
                <div className="username">
                    {username}
                </div>
                <button
                    className="logoutButton"
                    onClick={logout}
                >Logout</button>
                <button
                    className="anncButton"
                    onClick={() => {this.switchAnnc(true)}}
                >Annc.</button>
                <div className={`announcement${showAnnouncement ? " show" : ""}`}>
                    <div className="block">
                        <ul onScroll={onScroll}>
                            { readonly?.map((str, index) => <li key={index}>{str}</li>) }
                            { data?.map((str, index) => <li key={index}>{str}</li>) }
                        </ul>
                        <div className="buttonBar">
                            <button onClick={closeButtonOnClick} disabled={closeButtonText !== "Close"}>{closeButtonText}</button>
                            <label>
                                <input type="checkbox" checked={dontShowValue} onChange={() => {this.setState(state => {return {dontShowValue: !state.dontShowValue}})}} />
                                <span>Don't show me again before next update.</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
