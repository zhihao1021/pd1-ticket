import React from "react";

import { LoadingState } from "../../states";

import "./index.scss";

export default class Loading extends LoadingState {
    render(): React.ReactNode {
        const { show } = this.props;

        return (
            <div id="loading" className="page" data-show={show}>
                <h3>Loading...</h3>
                <div className="dotBox">
                    {Array.from(Array(12)).map((value, index) => (
                        <div
                            key={index}
                            className="dot"
                            style={{
                                "--delay": index
                            } as React.CSSProperties}
                        />
                    ))}
                </div>
            </div>
        )
    }
}
