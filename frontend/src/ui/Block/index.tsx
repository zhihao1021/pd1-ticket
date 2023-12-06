import React from "react";

import "./index.scss";

type propsType = Readonly<{
    title: string,
    children?: Array<React.ReactElement>|React.ReactElement,
    full?: boolean,
    className?: string
}>;

export default function Block(props: propsType): React.ReactElement {
    const {
        title,
        children,
        full,
        className,
    } = props;


    return (
        <div className="block" data-full={full === undefined ? true : full}>
            <h2>{title}</h2>
            <div className={`sec-block${className === undefined ? "" : " "}${className ?? ""}`}>
                {children}
            </div>
        </div>
    );
}
