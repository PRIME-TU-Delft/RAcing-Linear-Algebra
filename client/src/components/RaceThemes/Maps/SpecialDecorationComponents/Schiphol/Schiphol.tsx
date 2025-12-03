import BoatThemeSprites from "../../../Sprites/BoatThemeSprites";
import useWindowDimensions from "../../../Tracks/WindowDimensions";
import "./Schiphol.css"

function Schiphol() {
    const { width, height } = useWindowDimensions()
    const widthRatio = width / 1536
    const runwayHeight = widthRatio * 30
   
    return(
        <div className="schiphol-container">
            <div className="schiphol-plane-container">
                <img className="schiphol-plane" src={BoatThemeSprites.airplane} alt="Plane" />
            </div>
            <img style={{ height: runwayHeight, width: 'auto' }} className="schiphol-runway" src={BoatThemeSprites.runway} alt="Runway" />
        </div>
    )
}

export default Schiphol;