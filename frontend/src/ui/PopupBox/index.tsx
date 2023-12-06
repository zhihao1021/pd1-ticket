import React from "react";

import "./index.scss";

type propsType = Readonly<{
    show: boolean,
    message: string,
    close: () => void,
    ok?: Function,
    cancel?: Function,
    children?: React.ReactElement|Array<React.ReactElement>
}>;

export default function PopupBox(props: propsType): React.ReactElement {
    const {
        show,
        message,
        close,
        ok,
        cancel,
        children
    } = props;

    return (
        <div
            className="popupBox"
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                const target = event.target as HTMLElement;
                if (target.className === "popupBox") {
                    if (cancel) cancel();
                    close();
                }
            }}
            data-show={show}
        >
            <div className="box">
                <div className="outline">
                    <h2>Info</h2>
                    <div className="context">{message}{children}</div>
                    <div className="buttonBar">
                        <button
                            className="bt bt-cancel"
                            onClick={() => {
                                if (cancel) cancel();
                                close();
                            }}
                        >Cancel</button>
                        <button
                            className="bt bt-ok"
                            onClick={() => {
                                if (ok) ok();
                                close();
                            }}
                        >Ok</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
