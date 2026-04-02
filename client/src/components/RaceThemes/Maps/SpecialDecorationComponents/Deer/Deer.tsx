import BoatThemeSprites from "../../../Sprites/BoatThemeSprites"
import "./Deer.css"

interface Props {
    startLeft?: number
    startTop?: number,
    flipped?: boolean
}

function Deer(props: Props) {
    const randomDelay = `${Math.random() * 2}s`;

    return (
        <div
            className={"deer-container" + (props.flipped ? " flipped" : " not-flipped")}
            style={{
                left: `${props.startLeft || 0}%`,
                top: `${props.startTop || 0}%`,
                ['--deer-delay' as any]: randomDelay
            }}
        >
            <img
                src={BoatThemeSprites.deer}
                alt="Deer"
            />
        </div>
    )
}

export default Deer;