import BoatThemeSprites from "../../../Sprites/BoatThemeSprites"
import "./DuckSwim.css"

interface Props {
    startLeft?: number
    startTop?: number,
    flipped?: boolean,
    scale?: number
}

function DuckSwim(props: Props) {
    return (
        <div className={"duck-container" + (props.flipped ? " flipped" : " not-flipped")} style={{left: `${props.startLeft || 0}%`, top: `${props.startTop || 0}%` }}>
            <img style={{ transform: `scaleX(${props.flipped ? -1 : 1}) scale(${props.scale || 1})`}}
                src={BoatThemeSprites.duck}
                alt="Duck"
            />
        </div>
    )
}

export default DuckSwim;