import axios from "axios";
import React from "react";

import { apiEndPoint } from "../config";

import "./index.scss";

type propsType = Readonly<{
    show: boolean,
    switchLoading: (status?: boolean) => void,
    checkLogin: () => void,
}>;
type stateType = Readonly<{
    username: string | null,
    password: string | null,
    error: string,
}>;

export default class LoginPage extends React.Component<propsType, stateType> {
    constructor(props: propsType) {
        super(props);

        this.state = {
            username: null,
            password: null,
            error: "",
        };
        this.login = this.login.bind(this);
        this.onKyeDown = this.onKyeDown.bind(this);
    }

    onKyeDown(ev: React.KeyboardEvent) {
        if (ev.key === "Enter") {
            this.login();
        }
    }
    
    onInputChange(field: string) {
        const __func = (ev: React.ChangeEvent) => {
            let target = ev.target as HTMLInputElement;
            let value = target.value;
            this.setState((state) => {
                let newState = state as {[key: string]: string};
                newState[field] = value;
                if (state.error) {
                    newState["error"] = "";
                }
                return newState as stateType;
            });
        };
        return __func.bind(this);
    }

    login() {
        const {
            username,
            password
        } = this.state;
        if (((username ?? "") === "") || ((password ?? "") === "")) {
            this.setState({
                username: "",
                password: "",
                error: "帳號或密碼未輸入"
            })
            return;
        }
        this.props.switchLoading(true);
        axios.postForm(`${apiEndPoint}/oauth/login`, {
            username: username,
            password: password,
        }).then((response) => {
            let responseData: Readonly<{
                access_token: string, // JWT
                token_type: string    // Type
            }> = response.data;
            localStorage.setItem("access_token", responseData.access_token);
            localStorage.setItem("token_type", responseData.token_type);
            this.setState({
                username: null,
                password: null,
                error: "",
            });
            this.props.checkLogin();
        }).catch(() => {
            this.setState({
                password: "",
                error: "Login Failed."
            });
        }).finally(() => {
            this.props.switchLoading(false);
        })
    }

    render(): React.ReactNode {
        const {show} = this.props;
        const {
            username,
            password,
            error
        } = this.state;
        return (
            <div id="loginPage" className={show ? "show page" : "page"}>
                <div className="inputBlock" onKeyDown={this.onKyeDown}>
                    <h3>Login</h3>
                    <div className="inputBox">
                        <span className="ms-o">account_circle</span>
                        <input
                            placeholder="Account"
                            value={username ?? ""}
                            className={username === "" ? "empty" : ""}
                            onChange={this.onInputChange("username")}
                        />
                    </div>
                    <div className="inputBox">
                        <span className="ms-o">key</span>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password ?? ""}
                            className={password === "" ? "empty" : ""}
                            onChange={this.onInputChange("password")}
                        />
                    </div>
                    <div className="info">帳號密碼與SSH相同<br />Same to the account/password of SSH</div>
                    <div className={error === "" ? "error" : "error show"}>{error}</div>
                    <div className="loginButton" onClick={this.login}>Login</div>
                </div>
            </div>
        )
    }
}
