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
        <div></div>
    )
}

export default BestGhost
