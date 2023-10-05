import React from "react"
import Position from "../PathPosition"
import { Component, Checkpoint } from "../SharedUtils"
import "./Checkpoints.css"

interface Props {
    checkpoints: Checkpoint[] // list of checkpoints to display
    sprite: string // sprite to use for the checkpoint icons
    totalPoints: number // total number of points to complete the map
    pathLength: number // total length of the path
    components: Component[] // list of components of the path
}

function Checkpoints(props: Props) {
    return (
        <div>
            {props.checkpoints.map((checkpoint, index) => (
                <div
                    data-testid={`checkpoint${index}`}
                    key={index}
                    className="checkpoint-element"
                    style={Position.getCheckpointPosition(
                        checkpoint.points / props.totalPoints,
                        props.pathLength,
                        props.components
                    )}
                >
                    <div className="img-container">
                        <img src={props.sprite} />
                    </div>
                    <div className="checkpoint-name">{checkpoint.name}</div>
                </div>
            ))}
        </div>
    )
}

export default Checkpoints
