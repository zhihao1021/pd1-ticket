import "./index.scss";

import { LoginPageState } from "../../states";

export default class LoginPage extends LoginPageState {
    render(): React.ReactNode {
        const {
            logined
        } = this.props;
        const {
            account, accountWarning, password, passwordWarning, error,
        } = this.state;

        return (
            <div id="loginPage" className="page" data-show={!logined} onKeyDown={this.onPressEnter}>
                <div className="box">
                    {/* 標題 */}
                    <h2>Login</h2>
                    {/* 帳號輸入框 */}
                    <div className="inputBox" data-warning={accountWarning}>
                        <span className="ms-o">account_circle</span>
                        <input
                            value={account}
                            placeholder="Account"
                            onChange={this.changeAccount}
                        />
                    </div>
                    {/* 密碼輸入框 */}
                    <div className="inputBox" data-warning={passwordWarning}>
                        <span className="ms-o">key</span>
                        <input
                            value={password}
                            placeholder="Password"
                            onChange={this.changePassword}
                            type="password"
                        />
                    </div>
                    {/* 登入提示 */}
                    <div className="info">
                        帳號密碼與SSH相同。<br/>
                        Account and password are same as SSH.
                    </div>
                    {/* 錯誤提示輸入框 */}
                    { error ? <div className="error">{error}</div> : undefined}
                    {/* 登入按鈕 */}
                    <button onClick={this.login}>Login</button>
                </div>
            </div>
        );
    }
}

