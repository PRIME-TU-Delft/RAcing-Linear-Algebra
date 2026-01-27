import BoatThemeSprites from "../../../Sprites/BoatThemeSprites"
import "./Cruise.css"

interface Props {
    startLeft?: number
    startTop?: number,
    scale?: number
}

function Cruise(props: Props) {
    return (
        <div className={"cruise-container"} style={{left: `${props.startLeft || 0}%`, top: `${props.startTop || 0}%` }}>
            <img style={{ transform: `scaleX(1) scale(${props.scale || 1})`}}
                src={BoatThemeSprites.cruise}
                alt="Cruise"
            />
        </div>
    )
}

export default Cruise;