import React from "react";
import "./PowerUpsContainer.css"
import PowerupsContainerIcon from "../../../../img/powerups-container-icon.png"

function PowerUpsContainer() {
  return (
    <div className="power-ups-container">
        <div className="container-symbol-element d-flex justify-content-center align-items-center">
            <img className="symbol-image" src={PowerupsContainerIcon} alt="" />
        </div>
    </div>
  )
}

export default PowerUpsContainer