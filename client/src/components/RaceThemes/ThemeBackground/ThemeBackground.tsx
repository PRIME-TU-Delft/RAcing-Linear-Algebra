import React from "react";
import "./ThemeBackground.css"
import BoatThemeSprites from "../Sprites/BoatThemeSprites";

interface Props {
    theme: string
}

function ThemeBackground(props: Props) {

    const getBackground = () => {
        switch(props.theme.toLowerCase()) {
            case "boat":
                return (
                <div>
                    <div className="waves">
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                    </div>
                    <div className="terrain-layout">
                        <img src={BoatThemeSprites.terrain} alt="Boat Terrain"></img>
                    </div>
                </div>
                )
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