import React from "react";

import { getAnnouncement } from "../../api/announcement";

type propsType = Readonly<{
    show: boolean
}>;
type stateType = Readonly<{
    announcement: Array<string>
}>;

export default class AnnouncementPageState extends React.Component<propsType, stateType> {
    constructor(props: propsType) {
        super(props);

        this.state = {
            announcement: []
        };
    }

    componentDidMount(): void {
        this.#getAnnouncement();
    }

    #getAnnouncement() {
        getAnnouncement().then((data) => {
            this.setState({announcement: data})
        })
    }
}
