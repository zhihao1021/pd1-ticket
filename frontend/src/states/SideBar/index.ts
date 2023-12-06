import React from "react";

import { pageType } from "../../schemas/pages";

import { setting } from "../../utils";

type propsType = Readonly<{
    logined: boolean,
    username: string,
    selectPage: pageType,
    switchTheme: () => void,
}>;
type stateType = Readonly<{
    display: boolean
}>;

export default class SideBarState extends React.Component<propsType, stateType> {
    ref: React.RefObject<HTMLDivElement>
    constructor(props: propsType) {
        super(props);

        this.state = {
            display: setting("displaySideBar", true, "read")
        };

        this.ref = React.createRef();

        this.switchDisplay = this.switchDisplay.bind(this);
    }

    componentDidMount(): void {
        document.addEventListener("click", (event: MouseEvent) => {
            const target = event.target;
            if (target === null) return;
            if (!this.ref.current?.contains(target as Node) && this.state.display)  {
                this.setState({display: false});
            }
        });
        this.ref.current?.querySelectorAll("div.body").forEach(element => {
            element.addEventListener("click", () => {this.setState({display: false})});
        })
    }

    switchDisplay() {
        this.setState(state => {
            setting("displaySideBar", !state.display, "write");
            return {display: !state.display};
        });
    }

    logout() {
        localStorage.removeItem("access_token");
        window.location.reload();
    }
}
