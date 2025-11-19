import BoatThemeSprites from "../../../Sprites/BoatThemeSprites";
import "./Schiphol.css"

function Schiphol() {
    return(
        <div className="schiphol-container">
            <div className="schiphol-plane-container">
                <img className="schiphol-plane" src={BoatThemeSprites.airplane} alt="Plane" />
            </div>
            <img className="schiphol-runway" src={BoatThemeSprites.runway} alt="Runway" />
        </div>
    )
}

export default Schiphol;