import React from "react";

import "./index.scss";

type propsType = Readonly<{
    show: boolean
}>;

export default function Loading(props: propsType): React.ReactElement {
    const {show} = props;
    return (
        <div id="loading" className={show ? "show" : undefined}>
            <h3>Loading...</h3>
            <div className="dotBox">
                {
                    Array.from(Array(12)).map((value, index) => {
                        return <div
                            key={value}
                            className="dot"
                            style={
                                {
                                    "--delay": index
                                } as React.CSSProperties
                            }
                        />
                    })
                }
            </div>
        </div>
    )
}
