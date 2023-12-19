import React, { useEffect, useState } from "react"
import { Ghost } from "../SharedUtils"
import { motion } from "framer-motion"
import { RaceObject } from "../SharedUtils"
import { formatRacePositionText } from "../RaceService"
import "./Ghosts.css"

interface Props {
    ghosts: Ghost[] // list of ghosts to display
    path: string // svg path for the ghosts to take
    totalPoints: number // total points required to reach the end of the map
    sprite: string // sprite to use for the ghosts icon
    time: number // current round time
    mainVehiclePosition: number // race position of the main (currently playing) team
    onGhostScoreUpdate: (newScore: number, ghostIndex: number) => void  // update function for race score
    getRacePosition: (ghostIndex: number) => number // Retrieves the position for the ghost, given its index
}

function Ghosts(props: Props) {

    useEffect(() => {
        if (!props.ghosts || props.ghosts.length == 0 || props.ghosts[0].timeScores.length == 0) return
        for (let i = 0; i < props.ghosts.length; i++) {
            // Introduce constants to reduce code repetition
            const currentTimeScoreIndex = props.ghosts[i].animationStatus.timeScoreIndex
            const currentGhostTimePoint = props.ghosts[i].timeScores[currentTimeScoreIndex].timePoint
            const currentGhostNewScore = props.ghosts[i].timeScores[currentTimeScoreIndex].score

            // If the time matches a ghost's time point, it is time to update its score (make it move)
            if (currentGhostTimePoint == props.time) {    
                const progress = ((currentGhostNewScore % props.totalPoints) / props.totalPoints) * 100 // progress determined as the ratio of points and total points
                const newTimeScoreIndex = currentTimeScoreIndex == props.ghosts[i].timeScores.length ? currentTimeScoreIndex : currentTimeScoreIndex + 1
                // Since the ghosts can't move backwards, if the new progress value is smaller than the old, it means we are in a new race lap
                if (props.ghosts[i].animationStatus.pathProgress >= progress) {

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
                            props.onGhostScoreUpdate(currentGhostNewScore, i)
                        }, 800)
                    }, 1500)
                } else {
                    props.ghosts[i].animationStatus = {
                        pathProgress: progress, 
                        transitionDuration: 1,  // randomize duration of animation between 1 and 5 seconds, for more variation
                        timeScoreIndex: currentTimeScoreIndex == props.ghosts[i].timeScores.length ? currentTimeScoreIndex : currentTimeScoreIndex + 1  // increase index unless last score reached
                    }
                    setTimeout(() => {
                        props.onGhostScoreUpdate(currentGhostNewScore, i)
                    }, 1000)
                }
            }
        }
    }, [props.time])

    /**
     * Determines whether a ghost is classified as open based on its position.
     * Currently, ghosts are considered open if they fulfill one of the following conditions:
     *      - the ghost is in the top 3 in terms of position
     *      - the ghost is just ahead of the playing team
     *      - the ghost is just below of the playing team
     * @param ghostIndex    index of the ghost
     * @returns whether the ghost is considered open or not
     */
    const currentGhostIsOpen = (ghostIndex: number) => {
        const positionIndex = props.getRacePosition(ghostIndex)
        if (positionIndex < 3) return true  // top 3 ghosts are always open
        else if (positionIndex - 1 == props.mainVehiclePosition) return true    //  ghost behind main team open
        else if (positionIndex + 1 == props.mainVehiclePosition) return true    // ghost ahead of main team is open
        else return false   
    }

    const getRacePositionText = (ghostIndex: number) => {
        const positionIndex = props.getRacePosition(ghostIndex)
        if (positionIndex != -1) return formatRacePositionText(positionIndex + 1)
        else return ""
    }

    const getNumberOfLapsCompleted = (ghost: Ghost) => {
        const timeScoreIndex= ghost.animationStatus.timeScoreIndex
        const score = ghost.timeScores[Math.max(timeScoreIndex - 1, 0)].score
        return Math.floor(score / props.totalPoints)
    }

    const getGhostStyle = (ghostIndex: number) => {
        const isOpen = currentGhostIsOpen(ghostIndex)
        if (isOpen) {
            return {
                height: "60px",
                width: "60px",
                backgroundColor: "white"
            }
        } else {
            return {
                height: "30px",
                width: "30px",
                backgroundColor: props.ghosts[ghostIndex].color
            }
        }
    }
    return (
        <div>
            {props.ghosts.map((ghost, index) => (
                <motion.div
                    data-testid={`ghost${index}`}
                    key={index}
                    style={{
                        offsetPath: `path("${props.path}")`,
                        zIndex: 20 - props.getRacePosition(index)    
                    }}
                    className="ghost"
                    initial={{ offsetDistance: "0%", filter: "saturate(0.3)" }}
                    animate={{ 
                        offsetDistance: ghost.animationStatus.pathProgress.toString() + "%",
                        filter: `saturate(${0.3 + getNumberOfLapsCompleted(ghost) * 0.6})`
                    }}
                    transition={{
                        ease: "easeInOut",
                        duration: ghost.animationStatus.transitionDuration,
                        stiffness: 100,
                    }}
                >
                    {/* Only show position for ghosts that are open (check function description) */}
                    {currentGhostIsOpen(index) ? (<motion.div 
                        style={{
                            color: ghost.color,
                            borderColor: ghost.color
                        }}
                        initial={{
                            opacity: "0%",
                        }}
                        animate={{
                            opacity: "100%"
                        }}
                        transition={{
                            duration: 0.5
                        }}
                        className="position-number">
                            {getRacePositionText(index)}
                    </motion.div>) : null}
                    
                    <motion.div
                        initial={{
                            height: "60px",
                            width: "60px",
                            backgroundColor: "white"
                        }}
                        animate={getGhostStyle(index)}
                        transition={{
                            duration: 0.5,
                            stiffness: 100
                        }}
                        style={{
                            borderColor: ghost.color
                        }}
                        className="ghost-vehicle rounded-circle"
                    >
                       <motion.img
                        src={props.sprite}
                        animate={{
                            opacity: currentGhostIsOpen(index) ? "100%" : "0%"
                        }}
                        transition={{
                            duration: 0.2,
                            stiffness: 100
                        }}
                        alt="ghost"
                        className="img-fluid" /> 
                    </motion.div>
                
                </motion.div>
            ))}
        </div>
    )
}

export default Ghosts
