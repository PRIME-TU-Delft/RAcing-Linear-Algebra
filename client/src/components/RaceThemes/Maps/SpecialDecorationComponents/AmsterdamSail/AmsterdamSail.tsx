import BoatThemeSprites from "../../../Sprites/BoatThemeSprites";
import "./AmsterdamSail.css"

function AmsterdamSail() {
    return(
        <div className="amsterdam-sail-container">
            <div>
                <img src={BoatThemeSprites.boat1} alt="Boat1" />
                <img src={BoatThemeSprites.boat2} alt="Boat2" />
                <img src={BoatThemeSprites.boat3} alt="Boat3" />
                <img src={BoatThemeSprites.boat1} alt="Boat4" />
                <img src={BoatThemeSprites.boat2} alt="Boat5" />
                <img src={BoatThemeSprites.boat3} alt="Boat6" />

            </div>
        </div>
    )
}

export default AmsterdamSail;