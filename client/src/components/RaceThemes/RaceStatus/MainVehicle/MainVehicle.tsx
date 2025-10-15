import { clamp, motion, useAnimationControls } from "framer-motion";
import React, { useContext, useEffect, useState } from "react";
import VehicleImage from "../../VehicleImage/VehicleImage";
import { formatRacePositionText, getColorForRaceLap, getZIndexValues } from "../../RaceService";
import { RacePathContext } from "../../../../contexts/RacePathContext";
import { RaceDataContext } from "../../../../contexts/RaceDataContext";
import { ScoreContext } from "../../../../contexts/ScoreContext";
import zIndex from "@mui/material/styles/zIndex";

interface Props {
    racePosition: number
    progressPercent: number
    path: string
    isOnMinimap: boolean
}

function MainVehicle(props: Props) {
    const raceData = useContext(RaceDataContext)
    const scores = useContext(ScoreContext)
    const [currentProgress, setCurrentProgress] = useState(0)

    const getNumberOfRaceLapsCompleted = (totalPoints: number, currentPoints: number) => {
        return Math.floor(currentPoints / totalPoints)
    }
    const animationControls = useAnimationControls()

    useEffect(() => {
        playAnimation()
    }, [props.progressPercent])

    const playAnimation = () => {
        // Since the team can't move backwards, if the new progress value is smaller than the old, it means we are in a new race lap
        if (props.progressPercent < currentProgress) {
            animationControls.start({   // First, complete the lap
                offsetDistance: "100%",
                transition: { duration: 1.5 }
            }).then((val) => {
                animationControls.set({   // Then, reset the progress to 0 so it doesn't travel from 100 backwards
                    offsetDistance: "0%",
                    transition: { delay: 1000 }
                })
            }).then((val) => {
                animationControls.start({   // Finally, play the animation leading to the new progress value
                    offsetDistance: (props.progressPercent * 100).toString() + "%",
                    transition: { duration: 1, delay: 0.5 }
                })
                setCurrentProgress(curr => props.progressPercent)
            })
        }
        else {
            animationControls.start({   // Else, just update the progress normally
                offsetDistance: (props.progressPercent * 100).toString() + "%",
                transition: { duration: 1.5 }
            })
            setCurrentProgress(curr => props.progressPercent)
        }
    }

    return(
        <div>
            {/* Displays the main vehicle, representing the team currently playing */}
            <motion.div
                data-testid={"main-vehicle"}
                className="main-vehicle"
                style={{ 
                    offsetPath: `path("${props.path}")`,
                    zIndex: 999999
                }}
                initial={{ offsetDistance: "0%"}}
                animate={animationControls}
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