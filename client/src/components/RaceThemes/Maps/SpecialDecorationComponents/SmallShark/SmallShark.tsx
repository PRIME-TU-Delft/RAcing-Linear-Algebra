import BoatThemeSprites from "../../../Sprites/BoatThemeSprites"
import "./SmallShark.css"

interface Props {
    startLeft?: number
    startTop?: number,
    flipped?: boolean,
    scale?: number
}

function SmallShark(props: Props) {
    const randomDelay = `${Math.random() * 2}s`;
    
    return (
        <div className={"smallshark-container" + (props.flipped ? " flipped" : " not-flipped")} style={{left: `${props.startLeft || 0}%`, top: `${props.startTop || 0}%`,  ['--shark-delay' as any]: randomDelay}}>
            <img style={{ transform: `scaleX(${props.flipped ? -1 : 1}) scale(${props.scale || 1})`}}
                src={BoatThemeSprites.shark}
                alt="Small Shark"
            />
        </div>
    )
}

export default SmallShark;