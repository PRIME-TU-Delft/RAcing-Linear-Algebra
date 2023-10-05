import React from "react"
import { Ghost } from "../SharedUtils"
import { motion } from "framer-motion"

interface Props {
    ghosts: Ghost[] // list of ghosts to display
    totalPoints: number // total points required to complete the map
    colors: string[] // list of colors for the ghosts
    path: string // svg path for the ghosts to take
    sprite: string // sprite to use for the ghosts icon
}

function Ghosts(props: Props) {
    return (
        <div>
            {props.ghosts.map((ghost, index) => (
                <motion.div
                    data-testid={`ghost${index}`}
                    key={index}
                    className="progress-point rounded-circle ghost"
                    style={{
                        borderColor: props.colors[index],
                        offsetPath: `path("${props.path}")`,
                    }}
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{
                        duration: (props.totalPoints * 600) / ghost.score,
                        stiffness: 100,
                    }}
                >
                    <div
                        className="name"
                        style={{
                            color: props.colors[index],
                            borderBottomColor: props.colors[index],
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
