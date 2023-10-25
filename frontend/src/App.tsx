import React from "react";
import jwtDecode from "jwt-decode";

import Loading from "./Loading";
import LoginPage from "./LoginPage";
import CodePage from "./CodePage";
import UploadPage from "./UploadPage";

import "./App.scss";

type propsType = Readonly<{}>;
type stateType = Readonly<{
	hash: string | null,
	showPage: number,
	loading: boolean,
	login: boolean,
	username: string
}>;

export default class App extends React.Component<propsType, stateType> {
	constructor(props: propsType) {
		super(props);

		this.state = {
			hash: null,
			showPage: 0,
			loading: false,
			login: localStorage.getItem("access_token") !== null &&
				localStorage.getItem("token_type") !== null,
			username: "",
		};

		this.getHash = this.getHash.bind(this);
		this.switchPage = this.switchPage.bind(this);
		this.switchLoading = this.switchLoading.bind(this);
		this.checkLogin = this.checkLogin.bind(this);
		this.logout = this.logout.bind(this);

		window.addEventListener("hashchange", this.getHash);
	}

	componentDidMount(): void {
		this.getHash();
		this.checkLogin();
	}

	getHash(): string | null {
		let hash: string | null = window.location.hash.replace("#", "");
		if (hash === "") hash = null;
		if (hash !== this.state.hash) {
			this.setState({hash: hash})
			if (hash !== null) {
				this.switchPage(1);
			}
			else {
				this.switchPage(0);
			}
		};
		return hash;
	}

	checkLogin(): void {
		this.setState((state) => {
			let logined = localStorage.getItem("access_token") !== null &&
				localStorage.getItem("token_type") !== null
			let token = localStorage.getItem("access_token");
			let username: string | null = null;
			if (logined && token !== null) {
				try {
					let jwtData: {
						username: string,
						password: string,
						admin: boolean,
					} = jwtDecode(token);
					username = jwtData.username;
				}
				catch {}
			}
			return {
				login: logined,
				username: username ?? "",
			}
		});
	}

	logout() {
		localStorage.removeItem("access_token");
		localStorage.removeItem("token_type");
		this.checkLogin();
	}

	switchPage(page: number): void {
		if (page === this.state.showPage) return;
		this.setState({showPage: page});
	}

	switchLoading(status?: boolean) {
		this.setState(state => {
			return {
				loading: status === undefined ? !state.loading : status,
			}
		});
	}

	render(): React.ReactNode {
		const {
			hash,
			showPage,
			loading,
			login,
			username
		} = this.state;
		return (
			<div id="app">
				{
					login ?
					<div className="logoutBlock">
						<div className="username">
							{username}
						</div>
						<div
							className="logoutButton"
							onClick={this.logout}
						>Logout</div>
					</div> : null
				}
				<Loading
					show={loading}
					/>
				<LoginPage
					show={!login}
					checkLogin={this.checkLogin}
					switchLoading={this.switchLoading}
				/>
				<UploadPage
					login={login}
					show={showPage === 0}
					switchLoading={this.switchLoading}
				/>
				<CodePage
					login={login}
					show={showPage === 1}
					hash={hash}
					switchLoading={this.switchLoading}
					switchPage={this.switchPage}
				/>
			</div>
		);
	}
}
