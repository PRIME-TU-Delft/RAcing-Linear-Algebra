import React from "react";
import "./ThemeBackground.css"

interface Props {
    theme: string
}

function ThemeBackground(props: Props) {

    const getBackground = () => {
        switch(props.theme.toLowerCase()) {
            case "boat":
                return (<div className="waves">
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                        </div> )
            default:
                return <div></div>
        }
    }

    return(
        <div>
            {getBackground()}
        </div>
    )
}

export default ThemeBackground