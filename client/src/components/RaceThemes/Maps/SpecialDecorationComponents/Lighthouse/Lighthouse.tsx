import BoatThemeSprites from "../../../Sprites/BoatThemeSprites";
import "./Lighthouse.css"

function Lighthouse() {
    return(
        <div className="lighthouse-container">
            <div>
                <img src={BoatThemeSprites.lighthouse} alt="Lighthouse" />
                <img src={BoatThemeSprites.lighthouseGlow} alt="Lighthouse" />
            </div>
        </div>
    )
}

export default Lighthouse;