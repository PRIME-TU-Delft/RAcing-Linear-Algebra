import React, { useState } from "react";
import "./CardCooldownGraphic.css"
import TrainCooldownImage from "../../../../img/railworks.png"
import { Card } from "react-bootstrap";

function CardCooldownGraphic() {
    const [isHovering, setIsHovering] = useState<boolean>(false)

    return(
        <div className="cooldown-card d-flex justify-content-center" onMouseEnter={() => setIsHovering(curr => true)} onMouseLeave={() => setIsHovering(curr => false)}>
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