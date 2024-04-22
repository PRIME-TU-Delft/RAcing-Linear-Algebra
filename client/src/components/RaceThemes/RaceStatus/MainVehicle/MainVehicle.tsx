import { motion } from "framer-motion";
import React, { useContext } from "react";
import VehicleImage from "../../VehicleImage/VehicleImage";
import { formatRacePositionText, getColorForRaceLap, getZIndexValues } from "../../RaceService";
import { RacePathContext } from "../../../../contexts/RacePathContext";
import { RaceDataContext } from "../../../../contexts/RaceDataContext";
import { ScoreContext } from "../../../../contexts/ScoreContext";

interface Props {
    racePosition: number
    progressPercent: number
    path: string
    isOnMinimap: boolean
}

function MainVehicle(props: Props) {
    const raceData = useContext(RaceDataContext)
    const scores = useContext(ScoreContext)
    const getNumberOfRaceLapsCompleted = (totalPoints: number, currentPoints: number) => {
        return Math.floor(currentPoints / totalPoints)
    }
    return(
        <div>
            {/* Displays the main vehicle, representing the team currently playing */}
            <motion.div
                data-testid={"main-vehicle"}
                className="main-vehicle"
                style={{ 
                    offsetPath: `path("${props.path}")`,
                    zIndex: getZIndexValues().mainVehicle
                }}
                initial={{ offsetDistance: "0%"}}
                animate={{ 
                    offsetDistance: `${props.progressPercent * 100}%`
                }}
                transition={{
                    ease: "easeInOut",
                    duration: 2,
                    stiffness: 100,
                }}
            >
                <div className={props.isOnMinimap ? "minimap-main-vehicle-text" : "main-vehicle-position-number main-vehicle-text"} style={{zIndex: getZIndexValues().mainVehicle + 20}}>{formatRacePositionText(props.racePosition + 1)}</div>
                <div className={props.isOnMinimap ? "minimap-vehicle-image-container rounded-circle" : "vehicle-image-container rounded-circle"} style={{ borderColor: getColorForRaceLap(getNumberOfRaceLapsCompleted(scores.totalPoints, scores.currentPoints)) }}>
                    <VehicleImage 
                        theme={raceData.theme} 
                        colors={{
                            mainColor: "#0021A7",
                            highlightColor: "#F8B700"
                        }} />
                </div>
            </motion.div>
        </div>
    )
}

export default MainVehicle