import { AxiosError } from "axios";
import React from "react";

import { login } from "../../api/oauth";
import {
    addMessage,
    switchLoading
} from "../../publicFunction";

type propsType = Readonly<{
    logined: boolean,
    callback: () => void,
}>;
type stateType = Readonly<{
    account: string,
    password: string,
    accountWarning: boolean,
    passwordWarning: boolean,
    error: string,
}>;

export default class LoginPageState extends React.Component<propsType, stateType> {
    sendingRequest: boolean
    constructor(props: propsType) {
        super(props);

        this.state = {
            account: "",
            accountWarning: false,
            password: "",
            passwordWarning: false,
            error: "",
        };
        this.sendingRequest = false;

        this.changeAccount = this.changeAccount.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.onPressEnter = this.onPressEnter.bind(this);
        this.login = this.login.bind(this);
    }

    #changeValue(field: "account" | "password", event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        switch (field) {
            case "account":
                this.setState({
                    account: value,
                    accountWarning: value === "",
                    error: "",
                });
                break;
            case "password":
                this.setState({
                    password: value,
                    passwordWarning: value === "",
                    error: "",
                });
                break;
        }
    }

    changeAccount(event: React.ChangeEvent<HTMLInputElement>) {
        this.#changeValue("account", event);
    }

    changePassword(event: React.ChangeEvent<HTMLInputElement>) {
        this.#changeValue("password", event);
    }

    onPressEnter(event: React.KeyboardEvent) {
        if (event.key === "Enter" && !this.props.logined && !this.sendingRequest) {
            this.login();
        }
    }

    async login() {
        const {
            callback
        } = this.props;
        const {
            account,
            password,
        } = this.state;

        // 帳號密碼不得為空
        if (!account || !password) {
            this.setState({
                error: "Account or password is empty.",
                accountWarning: account === "",
                passwordWarning: password === "",
            });
            return;
        }
        
        switchLoading(true);
        // 嘗試登入
        try {
            this.sendingRequest = true;
            await login(account, password);
            this.setState({
                account: "",
                password: "",
            });
        } catch (exc) {
            // 登入失敗
            const error = exc as AxiosError;
            const errorMessage = error.response?.status === 401 ?
                "Wrong account or password." :
                `Unknow error, code: ${error.response?.status}`;
            this.setState({
                password: "",
                passwordWarning: true,
                error: errorMessage
            });
            addMessage("ERROR", "登入失敗。\nLogin Failed.")
            return;
        }
        finally {
            this.sendingRequest = false;
            switchLoading(false);
        }

        // 登入成功
        callback();
        addMessage("INFO", "登入成功。\nLogin success.")
    }
}
