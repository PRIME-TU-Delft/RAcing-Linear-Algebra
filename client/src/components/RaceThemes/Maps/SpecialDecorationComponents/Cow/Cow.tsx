import React from "react";
import TrainThemeSprites from "../../../Sprites/TrainThemeSprites";
import "./Cow.css";
import { DecorationElement, PercentCoordinate } from "../../../SharedUtils";

interface Props {
    decorations: DecorationElement[],
    position: PercentCoordinate
}

function Cow(props: Props) {
    const [targetGrassPosition, setTargetGrassPosition] = React.useState<PercentCoordinate | null>(null);
    const [nearbyGrassPositions, setNearbyGrassPositions] = React.useState<PercentCoordinate[]>([]);
    
    return (
        <div 
            className="cow-container" 
            style={{ left: `${props.position.xPercent * 100}%`, top: `${props.position.yPercent * 100}%` }}>
                <img
                    src={TrainThemeSprites.cowWalk}
                    alt="Seagull"
                />
        </div>
    );
}

export default Cow;