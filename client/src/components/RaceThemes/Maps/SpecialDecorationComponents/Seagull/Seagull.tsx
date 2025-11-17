import TrainThemeSprites from "../../../Sprites/TrainThemeSprites"
import "./Seagull.css"

function Seagull() {
    return (
        <div className="seagull-container">
            <img
                src={TrainThemeSprites.seagull}
                alt="Seagull"
            />
        </div>
    )
}

export default Seagull;