import { AnnouncementPageState } from "../../states";

import { Block } from "../../ui";

import "./index.scss";

export default class AnnouncementPage extends AnnouncementPageState {
    render(): React.ReactNode {
        const { show } = this.props;
        const { announcement } = this.state;

        return (
            <div id="announcement" className="page" data-show={show}>
                <Block title="Announcement">
                    <ul>
                        {announcement.map((v, index) => <li key={index}>
                            {v}
                        </li>)}
                    </ul>
                </Block>
            </div>
        );
    }
}
