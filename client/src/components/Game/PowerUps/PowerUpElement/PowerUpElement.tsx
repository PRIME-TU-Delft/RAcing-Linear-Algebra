import React from "react";
import "./PowerUpElement.css";

interface Props {
    onClick: () => void
}

function PowerUpElement(props: Props) {
    return (
        <div className="power-up-element" onClick={props.onClick}>

            
        </div>
    )
}

export default PowerUpElement;