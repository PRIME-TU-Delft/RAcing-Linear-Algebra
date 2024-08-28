import React, { useState } from "react";
import "./CardCooldownGraphic.css"
import TrainCooldownImage from "../../../../img/railworks.png"

import { Card } from "react-bootstrap";

function CardCooldownGraphic() {
    return(
        <div className="cooldown-card d-flex justify-content-center">
             <Card>
                <Card.Body>
                    <div className="cooldown-image-container d-flex justify-content-center">
                        <img className="cooldown-image" src={TrainCooldownImage} alt="" />
                    </div>
                </Card.Body>
            </Card>
        </div>
    )
}

export default CardCooldownGraphic