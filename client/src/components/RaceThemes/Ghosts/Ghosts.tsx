import React, { useEffect, useState } from "react"
import { Ghost } from "../SharedUtils"
import { motion } from "framer-motion"
import { useSpring, animated, a, useTransition, useSpringRef } from '@react-spring/web'
import {currentGhostIsOpen, getColorForStudy, getGhostStyle, getRacePositionText} from "./GhostService"
import { getColorForRaceLap } from "../RaceService"
import "./Ghosts.css"
import GhostText from "./GhostText/GhostText"
import VehicleImage from "../VehicleImage/VehicleImage"

interface Props {
    ghosts: Ghost[] // list of ghosts to display
    path: string // svg path for the ghosts to take
    totalPoints: number // total points required to reach the end of the map
    theme: string // sprite to use for the ghosts icon
    time: number // current round time
    mainVehiclePosition: number // race position of the main (currently playing) team
    onGhostScoreUpdate: (newScore: number, ghostIndex: number) => void  // update function for race score
    getRacePosition: (ghostIndex: number) => number // Retrieves the position for the ghost, given its index
}

function Ghosts(props: Props) {
    const raceLapColors = ["#23D851", "#E8E807", "#D81212", "#FF15E9", "#A129FF"]    // colors used to distinguish between the different race laps
    const [showTeamNames, setShowTeamNames] = useState<boolean>(false)  // boolean to indicate whether the ghost team names should be shown in favor of the position for a brief period of time
    const [startShowingPosition, setStartShowingPosition] = useState<boolean>(false) // boolean to indicate that the first ghost train has moved, so it is time to show the positions
    
    useEffect(() => {
        // Check whether all data required has been loaded, to prevent errors
        if (!props.ghosts || props.ghosts.length == 0 || props.ghosts[0].timeScores.length == 0) return

        // Every 30 seconds, briefly show the team names of the open ghosts instead of their position number
        if (props.time % 30 == 0) {
            setShowTeamNames(curr => true)
            setTimeout(() => setShowTeamNames(curr => false), 5000)
        }

        for (let i = 0; i < props.ghosts.length; i++) {
            // Introduce constants to reduce code repetition
            const currentTimeScoreIndex = props.ghosts[i].animationStatus.timeScoreIndex
            const currentGhostTimePoint = props.ghosts[i].timeScores[currentTimeScoreIndex].timePoint
            const currentGhostNewScore = props.ghosts[i].timeScores[currentTimeScoreIndex].score

            // If the time matches a ghost's time point, it is time to update its score (make it move)
            if (currentGhostTimePoint == props.time) {  
                if (!startShowingPosition) setStartShowingPosition(curr => true)

                const progress = ((currentGhostNewScore % props.totalPoints) / props.totalPoints) * 100 // progress determined as the ratio of points and total points
                const newTimeScoreIndex = currentTimeScoreIndex == props.ghosts[i].timeScores.length ? currentTimeScoreIndex : currentTimeScoreIndex + 1
                // Since the ghosts can't move backwards, if the new progress value is smaller than the old, it means we are in a new race lap
                if (props.ghosts[i].animationStatus.pathProgress >= progress) {

                    props.ghosts[i].lapsCompleted += 1  // increase the number of laps completed by the ghost

                    props.ghosts[i].animationStatus = {
                        pathProgress: 100,
                        transitionDuration: 1,
                        timeScoreIndex: newTimeScoreIndex
                    }
                    
                    setTimeout(() => {
                        props.ghosts[i].animationStatus = {
                            pathProgress: 0,
                            transitionDuration: 0,
                            timeScoreIndex: newTimeScoreIndex
                        }

                        setTimeout(() => {
                            props.ghosts[i].animationStatus = {
                                pathProgress: progress, 
                                transitionDuration: 1, 
                                timeScoreIndex: newTimeScoreIndex
                            }
                            props.onGhostScoreUpdate(currentGhostNewScore, props.ghosts[i].key)
                        }, 800)
                    }, 1500)
                } else {
                    props.ghosts[i].animationStatus = {
                        pathProgress: progress, 
                        transitionDuration: 1,  // randomize duration of animation between 1 and 5 seconds, for more variation
                        timeScoreIndex: currentTimeScoreIndex == props.ghosts[i].timeScores.length ? currentTimeScoreIndex : currentTimeScoreIndex + 1  // increase index unless last score reached
                    }
                    setTimeout(() => {
                        props.onGhostScoreUpdate(currentGhostNewScore, props.ghosts[i].key)
                    }, 1000)
                }
            }
        }
    }, [props.time])

    return (
        <div>
            {props.ghosts.map((ghost, index) => (
                <motion.div
                    data-testid={`ghost${index}`}
                    key={index}
                    style={{
                        offsetPath: `path("${props.path}")`,
                        zIndex: 6000 - props.getRacePosition(ghost.key)    
                    }}
                    className="ghost"
                    initial={{ offsetDistance: "0%"}}
                    animate={{ 
                        offsetDistance: ghost.animationStatus.pathProgress.toString() + "%"
                    }}
                    transition={{
                        ease: "easeInOut",
                        duration: ghost.animationStatus.transitionDuration,
                        stiffness: 100,
                    }}
                >
                    {/* Only show position for ghosts that are open (check function description) */}
                    {currentGhostIsOpen(props.getRacePosition(ghost.key), props.mainVehiclePosition) && startShowingPosition ? 
                    (<motion.div 
                        className="position-number"
                        style={{borderColor: getColorForRaceLap(ghost.lapsCompleted) }}>
                            <GhostText 
                                ghostTeamName={ghost.teamName} 
                                ghostStudy={ghost.study}
                                ghostRacePosition={getRacePositionText(props.getRacePosition(ghost.key))}
                                showTeamName={showTeamNames}
                            />
                    </motion.div>) : null}
                    <motion.div
                        initial={{
                            height: "55px",
                            width: "55px",
                            backgroundColor: "white",
                        }}
                        animate={
                            getGhostStyle(
                                currentGhostIsOpen(props.getRacePosition(ghost.key), props.mainVehiclePosition), 
                                getColorForRaceLap(ghost.lapsCompleted),
                                getColorForStudy(ghost.study).mainColor
                            )
                        }
                        transition={{
                            duration: 0.5,
                            stiffness: 100
                        }}
                        className="ghost-vehicle rounded-circle"
                    >
                        <motion.div 
                            className="ghost-vehicle-image-container"
                            animate={{
                                opacity: currentGhostIsOpen(props.getRacePosition(ghost.key), props.mainVehiclePosition) ? "100%" : "0%",
                            }}
                            transition={{
                                duration: 0.2,
                                stiffness: 100
                            }}>
                            <VehicleImage
                                theme={props.theme}
                                colors={{
                                    mainColor: ghost.colors.mainColor,
                                    highlightColor: ghost.colors.highlightColor
                                }}/>
                        </motion.div>
                    </motion.div>
                
                </motion.div>
            ))}
        </div>
    )
}

export default Ghosts
