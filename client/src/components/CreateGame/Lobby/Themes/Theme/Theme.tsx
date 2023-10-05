import React from "react"
import "./Theme.css"

interface Props {
    title: string
    description: string
    onSelectTheme: (theme: string) => void
    class: string
    icon: any
}

function Theme(props: Props) {
    return (
        <div
            className={"theme-container " + props.class}
            onClick={() => props.onSelectTheme(props.title)}
        >
            <div className="column left">
                <div className="theme-img">
                    <img
                        src={props.icon}
                        alt="icon"
                        className="lobby-icon"
                    ></img>
                </div>
            </div>

            <div className="column right">
                <div className="checked">&#9989;</div>
                <div className="theme-title">{props.title}</div>
                <div className="theme-description">{props.description}</div>
            </div>
        </div>
    )
}

export default Theme
