import React from "react";
import "./PowerUpsContainer.css"
import PowerupsContainerIcon from "../../../../img/powerups-container-icon.png"
import PowerUpElement from "../PowerUpElement/PowerUpElement";

function PowerUpsContainer() {
  return (
    <div className="power-ups-container d-flex">
        <div className="container d-flex justify-content-end align-items-center">
            <PowerUpElement/>
            <PowerUpElement/>
            <PowerUpElement/>
        </div>

        <div className="container-symbol-element d-flex justify-content-center align-items-center">
            <img className="symbol-image" src={PowerupsContainerIcon} alt="" />
        </div>
    </div>
  )
}

export default PowerUpsContainer