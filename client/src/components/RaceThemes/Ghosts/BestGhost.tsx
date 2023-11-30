import React from "react"
import { Ghost } from "../SharedUtils"
import "./Ghosts.css"

interface Props {
    bestGhost: Ghost // best ghost (team with highest score)
    totalPoints: number // total points required to reach the end of the map
    path: string // svg path the ghosts are taking
    sprite: string // sprite to use for the ghost icon
}

function BestGhost(props: Props) {
    return (
        <div
            className="progress-point rounded-circle best-ghost"
            style={{
                borderColor: "#FFD700",
                offsetPath: `path("${props.path}")`,
                offsetDistance: "0%",
            }}
        >
            <div className="highest-score">HIGHEST SCORE</div>
            <div
                className="name"
                style={{
                    color: "#FFD700",
                    borderBottomColor: "#FFD700",
                }}
            >
                {props.bestGhost.teamName}
            </div>
            <img src={props.sprite} alt="ghost" className="rounded-circle" />
        </div>
    )
}

export default BestGhost
