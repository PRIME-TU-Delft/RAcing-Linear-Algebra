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
    const [animations, setAnimations] = useState<GhostAnimation[]>(
        new Array(18).fill(0).map(x => (
            {
                pathProgress: 0,    // initialize all ghost to progress of 0%
                transitionDuration: 1,  // transition duration initalized at 1, changes when updating
                timeScoreIndex: 0   // intialize index to 0, so the ghost first aims to reach its first time score
            })))

    useEffect(() => {
        const newAnimations = animations
        if (!props.ghosts || props.ghosts.length != animations.length) return
        for (let i = 0; i < newAnimations.length; i++) {
            // Introduce constants to reduce code repetition
            const currentTimeScoreIndex = animations[i].timeScoreIndex
            const currentGhostTimePoint = props.ghosts[i].timeScores[currentTimeScoreIndex].timePoint
            const currentGhostNewScore = props.ghosts[i].timeScores[currentTimeScoreIndex].score

            // If the time matches a ghost's time point, it is time to update its score (make it move) 
            if (currentGhostTimePoint == props.time) {
                newAnimations[i] = {
                    pathProgress: Math.floor((currentGhostNewScore / props.totalPoints) * 100), // progress determined as the ratio of points and total points
                    transitionDuration: Math.floor(Math.random() * 5) + 1,  // randomize duration of animation between 1 and 5 seconds, for more variation
                    timeScoreIndex: currentTimeScoreIndex == props.ghosts[i].timeScores.length ? currentTimeScoreIndex : currentTimeScoreIndex + 1  // increase index unless last score reached
                }
            }
        }
        setAnimations(curr => [...newAnimations])
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
                    animate={{ offsetDistance: animations[index].pathProgress.toString() + "%" }}
                    transition={{
                        duration: animations[index].transitionDuration,
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
