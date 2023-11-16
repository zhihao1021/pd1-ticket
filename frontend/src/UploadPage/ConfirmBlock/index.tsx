import React from "react";

import "./index.scss";

type propsType = Readonly<{
    message: string,
    show: boolean,
    close: () => void,
    confirm?: () => void,
}>;

export default function ConfirmBlock(props: propsType): React.ReactElement {
    const {
        message,
        show,
        close,
        confirm
    } = props;

    return (
        <div
            id="confirmBlock"
            className={show ? "show" : undefined}
            onClick={(event) => {
                const target = event.target as HTMLElement;
                if (target.id !== "confirmBlock") return;
                close();
            }}
        >
            <div className="box">
                <h2>Info</h2>
                <div className="message">{message}</div>
                <div className="buttonBar">
                    <div className="cancel" onClick={close}>Cancel</div>
                    <div className="confirm" onClick={() => {if (confirm !== undefined) confirm();close();}}>Confirm</div>
                </div>
            </div>
        </div>
    );
}
