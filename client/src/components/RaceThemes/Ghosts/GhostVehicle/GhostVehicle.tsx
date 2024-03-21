import { motion, useAnimationControls } from "framer-motion";
import React, { useEffect } from "react";
import { Ghost } from "../../SharedUtils";
import { getColorForRaceLap, getZIndexValues } from "../../RaceService";
import { currentGhostIsOpen, getColorForStudy, getGhostStyle } from "../GhostService";
import GhostText from "../GhostText/GhostText";
import LapCompletedText from "../LapCompletedText/LapCompletedText";
import VehicleImage from "../../VehicleImage/VehicleImage";

interface Props {
    ghost: Ghost,
    path: string,
    mainVehiclePosition: number,
    showTeamNames: boolean,
    totalPoints: number,
    startShowingGhosts: boolean,
    theme: string,
    onGhostScoreUpdate: (newScore: number, ghostIndex: number) => void  // update function for race score
}

function GhostVehicle(props: Props) {
    const animationControls = useAnimationControls()

    /**
     * Updates the values of the ghost to account for reaching a new time point.
     * Also triggers parent event to inform it of the change in score
     * @param currentTimeScoreIndex index of the current time score
     * @param newScore  the new score for the ghost  
     * @param newProgress  the new race path progress of the ghost
     */
    const updateGhostValues = (currentTimeScoreIndex: number, newScore: number, newProgress: number) => {
        const newTimeScoreIndex = Math.min(currentTimeScoreIndex + 1, props.ghost.timeScores.length - 1)    // Clipping to prevent indexing errors
        props.onGhostScoreUpdate(newScore, props.ghost.key)
        props.ghost.animationStatus.timeScoreIndex = newTimeScoreIndex    
        props.ghost.animationStatus.pathProgress = newProgress
    }

    const playGhostAnimation = () => {
        // Introduce constants to reduce code repetition
        const currentTimeScoreIndex = props.ghost.animationStatus.timeScoreIndex
        const currentGhostNewScore = props.ghost.timeScores[currentTimeScoreIndex].score
        const progress = ((currentGhostNewScore % props.totalPoints) / props.totalPoints) * 100 // progress determined as the ratio of points and total points
    
        // Since the ghosts can't move backwards, if the new progress value is smaller than the old, it means we are in a new race lap
        if (props.ghost.animationStatus.pathProgress >= progress) {
            animationControls.start({   // First, complete the lap
                offsetDistance: "100%",
                transition: { duration: 1.5 }
            }).then((val) => {
                animationControls.set({   // Then, reset the progress to 0 so it doesn't travel from 100 backwards
                    offsetDistance: "0%",
                    transition: { delay: 1000 }
                })
                props.ghost.lapsCompleted += 1  // increase the number of laps completed by the ghost
            }).then((val) => {
                animationControls.start({   // Finally, play the animation leading to the new progress value
                    offsetDistance: progress.toString() + "%",
                    transition: { duration: 1, delay: 0.5 }
                })
                updateGhostValues(currentTimeScoreIndex, currentGhostNewScore, progress)
            })
        }
        else {
            animationControls.start({   // Else, just update the progress normally
                offsetDistance: progress.toString() + "%",
                transition: { duration: 1.5 }
            })
            updateGhostValues(currentTimeScoreIndex, currentGhostNewScore, progress)
        }
    }

    useEffect(() => {
        if (props.ghost.animationStatus.updateAnimation) {
            props.ghost.animationStatus.updateAnimation = false
            playGhostAnimation()
        }
    }, [props.ghost.animationStatus.updateAnimation])

    return(
        <motion.div
            data-testid={`ghost${props.ghost.key}`}
            key={props.ghost.key}
            style={{
                offsetPath: `path("${props.path}")`,
                zIndex: getZIndexValues().ghostVehicle - props.ghost.racePosition
            }}
            className="ghost"
            initial={{ offsetDistance: "0%"}}
            animate={animationControls}
        >
            {/* Only show position for ghosts that are open (check function description) */}
            {currentGhostIsOpen(props.ghost.racePosition, props.mainVehiclePosition) && props.startShowingGhosts ? 
            (<motion.div 
                className="position-number"
                style={{
                    borderColor: getColorForRaceLap(props.ghost.lapsCompleted), 
                    zIndex: getZIndexValues().ghostVehicle - props.ghost.racePosition + 20  // + 20 to make sure text is always on top of images
                }}>
                    <GhostText 
                        ghost={props.ghost}
                        showTeamName={props.showTeamNames}
                    />
            </motion.div>) : null}
            <LapCompletedText 
                lapsCompleted={props.ghost.lapsCompleted}/>
            <motion.div
                initial={{
                    height: "55px",
                    width: "55px",
                }}
                animate={
                    getGhostStyle(
                        currentGhostIsOpen(props.ghost.racePosition, props.mainVehiclePosition), 
                        getColorForRaceLap(props.ghost.lapsCompleted),
                        getColorForStudy(props.ghost.study).mainColor
                    )
                }
                transition={{
                    duration: 0.5,
                    stiffness: 100,
                    delay: 0.5
                }}
                className="ghost-vehicle rounded-circle"
            >
                <motion.div 
                    className="ghost-vehicle-image-container"
                    animate={{
                        opacity: currentGhostIsOpen(props.ghost.racePosition, props.mainVehiclePosition) ? "100%" : "0%",
                    }}
                    transition={{
                        duration: 0.2,
                        stiffness: 100,
                        delay: 0.5
                    }}>
                    <VehicleImage
                        theme={props.theme}
                        colors={{
                            mainColor: props.ghost.colors.mainColor,
                            highlightColor: props.ghost.colors.highlightColor
                        }}/>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

export default GhostVehicle