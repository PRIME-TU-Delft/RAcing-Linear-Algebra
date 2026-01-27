import TrainThemeSprites from "../../../Sprites/TrainThemeSprites"
import "./Seagull.css"

interface Props {
    theme?: string
}

function Seagull(props: Props) {
    return (
        <div className={props.theme ? `${props.theme}-seagull-container` : "seagull-container"}>
            <img
                src={TrainThemeSprites.seagull}
                alt="Seagull"
            />
        </div>
    )
}

export default Seagull;