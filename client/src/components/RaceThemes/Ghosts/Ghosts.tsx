import React, { useEffect, useState } from "react"
import { Ghost } from "../SharedUtils"
import { motion } from "framer-motion"


interface GhostAnimation {
    pathProgress: number    // current progress along the race path (percentage)
    transitionDuration: number  // duration of transition animation
    timeScoreIndex: number  // index of the time score the ghost is reaching next
}
interface Props {
    ghosts: Ghost[] // list of ghosts to display
    path: string // svg path for the ghosts to take
    totalPoints: number // total points required to reach the end of the map
    sprite: string // sprite to use for the ghosts icon
    time: number // current round time
}

function Ghosts(props: Props) {

    useEffect(() => {
        if (!props.ghosts) return
        for (let i = 0; i < props.ghosts.length; i++) {
            // Introduce constants to reduce code repetition
            console.log( "ASD")
            const currentTimeScoreIndex = props.ghosts[i].animationStatus.timeScoreIndex
            const currentGhostTimePoint = props.ghosts[i].timeScores[currentTimeScoreIndex].timePoint
            const currentGhostNewScore = props.ghosts[i].timeScores[currentTimeScoreIndex].score

            // If the time matches a ghost's time point, it is time to update its score (make it move)
            if (currentGhostTimePoint == props.time) {    
                const progress = Math.floor(((currentGhostNewScore % props.totalPoints) / props.totalPoints) * 100) // progress determined as the ratio of points and total points
                const duration = Math.floor(Math.random() * 5) + 1  // randomize duration of animation between 1 and 5 seconds, for more variation
                
                // Since the ghosts can't move backwards, if the new progress value is smaller than the old, it means we are in a new race lap
                if (props.ghosts[i].animationStatus.pathProgress >= progress) {

                    props.ghosts[i].animationStatus = {
                        pathProgress: 100,
                        transitionDuration: 1,
                        timeScoreIndex: currentTimeScoreIndex
                    }
                    
                    setTimeout(() => {
                        props.ghosts[i].animationStatus = {
                            pathProgress: 0,
                            transitionDuration: 0,
                            timeScoreIndex: currentTimeScoreIndex
                        }

                        setTimeout(() => {
                            props.ghosts[i].animationStatus = {
                                pathProgress: progress, 
                                transitionDuration: duration, 
                                timeScoreIndex: currentTimeScoreIndex < props.ghosts[i].timeScores.length ? currentTimeScoreIndex : currentTimeScoreIndex + 1  // increase index unless last score reached
                            }
                        }, 800)
                    }, 1500)
                } else {
                    props.ghosts[i].animationStatus = {
                        pathProgress: progress, 
                        transitionDuration: duration,  // randomize duration of animation between 1 and 5 seconds, for more variation
                        timeScoreIndex: currentTimeScoreIndex == props.ghosts[i].timeScores.length ? currentTimeScoreIndex : currentTimeScoreIndex + 1  // increase index unless last score reached
                    }
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
                    className="progress-point rounded-circle ghost"
                    style={{
                        borderColor: ghost.color,
                        offsetPath: `path("${props.path}")`,
                    }}
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: ghost.animationStatus.pathProgress.toString() + "%" }}
                    transition={{
                        ease: "easeInOut",
                        duration: ghost.animationStatus.transitionDuration,
                        stiffness: 100,
                    }}
                >
                    <div
                        className="name"
                        style={{
                            color: ghost.color,
                            borderBottomColor: ghost.color,
                        }}
                    >
                        {ghost.teamName}
                    </div>
                    <img
                        src={props.sprite}
                        alt="ghost"
                        className="rounded-circle"
                    />
                </motion.div>
            ))}
        </div>
    )
}

export default Ghosts
