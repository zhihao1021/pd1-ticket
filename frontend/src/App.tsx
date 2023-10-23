import React from "react";

import CodePage from "./CodePage";
import UploadPage from "./UploadPage";

import "./App.scss";

type propsType = Readonly<{}>;
type stateType = Readonly<{
	hash: string | null,
	showPage: number,
	loading: boolean
}>;

export default class App extends React.Component<propsType, stateType> {
	constructor(props: propsType) {
		super(props);

		this.state = {
			hash: null,
			showPage: 0,
			loading: false,
		};

		this.getHash = this.getHash.bind(this);
		this.switchPage = this.switchPage.bind(this);
		this.switchLoading = this.switchLoading.bind(this);

		window.addEventListener("hashchange", this.getHash);
	}

	componentDidMount(): void {
		this.getHash();
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
		return (
			<div id="app">
				<UploadPage
					switchLoading={this.switchLoading}
					show={this.state.showPage === 0}
				/>
				<CodePage
					show={this.state.showPage === 1}
					hash={this.state.hash}
					switchPage={this.switchPage}
				/>
			</div>
		);
	}
}
