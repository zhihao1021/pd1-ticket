import React from "react";

import "./index.scss";

type propsType = Readonly<{
    title: string,
    context: string,
    className?: string
}>;

export default function InfoBox(props: propsType): React.ReactElement {
    const {
        title,
        context,
        className
    } = props;
    return (
        <div className={`infoBox ${className ?? ""}`}>
            <h3>{title}</h3>
            <div>{context}</div>
        </div>
    );
}
