import TrainThemeSprites from "../../../Sprites/TrainThemeSprites";
import "./BeachSea.css"

function BeachSea() {
    return (
        <div className="beachSeaContainer">
            <div className="seaTop">
                <img src={TrainThemeSprites.seaTop} alt="Sea Top" />
            </div>
            <div className="seaBottom">
                <img src={TrainThemeSprites.seaBottom} alt="Sea Bottom" />
            </div>
            <div className="seaTrail">
                <img src={TrainThemeSprites.seaTrail} alt="Sea Trail" />
            </div>
        </div>
    )
}

export default BeachSea;