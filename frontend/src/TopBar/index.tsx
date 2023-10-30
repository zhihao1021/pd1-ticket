import axios from "axios";
import React from "react";

import { apiEndPoint } from "../config";

import "./index.scss";

type  propsType = Readonly<{
    show: boolean,
    username: string,
    logout: () => void,
}>;
type  stateType = Readonly<{
    showAnnouncement: boolean,
    announcements: {
        readonly: Array<string>,
        data: Array<string>,
    },
    dontShowValue: boolean
}>;

export default class TopBar extends React.Component<propsType, stateType> {
    constructor(props: propsType) {
        super(props);

        const dont_show_annc = localStorage.getItem("dontShowAnnc") === "true" ?? false;
        this.state = {
            showAnnouncement: false,
            announcements: {
                readonly: [],
                data: [],
            },
            dontShowValue: dont_show_annc
        };
    }

    componentDidMount(): void {
        axios.get(`${apiEndPoint}/announce`).then(
            (response) => {
                const old_annc_string = localStorage.getItem("announcement");
                const new_annc = response.data
                const new_annc_string = JSON.stringify(new_annc);
                const dont_show_annc = localStorage.getItem("dontShowAnnc") === "true" ?? false;

                const show = !(dont_show_annc && old_annc_string === new_annc_string);

                this.setState({
                    showAnnouncement: show,
                    announcements: new_annc
                });
                localStorage.setItem("announcement", new_annc_string);
            }
        );
    }

    switchAnnc(status: boolean) {
        this.setState({
            showAnnouncement: status,
        });
        if (status === false) {
            localStorage.setItem("dontShowAnnc", this.state.dontShowValue ? "true" : "false");
        }
    }

    render(): React.ReactNode {
        const {
            show,
            username,
            logout
        } = this.props;
        const {
            showAnnouncement,
            dontShowValue
        } = this.state;
        const {
            readonly,
            data
        } = this.state.announcements
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
                        <ul>
                            { readonly.map((str, index) => <li key={index}>{str}</li>) }
                            { data.map((str, index) => <li key={index}>{str}</li>) }
                        </ul>
                        <div className="buttonBar">
                            <button onClick={() => {this.switchAnnc(false)}}>Close</button>
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
