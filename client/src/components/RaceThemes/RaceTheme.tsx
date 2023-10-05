import React, { useEffect, useState } from "react"
import TrainTheme from "./TrainTheme/TrainTheme"
import BoatTheme from "./BoatTheme/BoatTheme"
import { Checkpoint, Ghost } from "./SharedUtils"
import socket from "../../socket"

interface Props {
    mapDimensions: {
        width: number // screen width of map section
        height: number // screen height of map section
    }
    maxPoints: number
    averageGoalPoints: number
    currentPoints: number
    checkpoints: Checkpoint[]
    usedTime: number
    selectedTheme: string
    setCheckpoint: (data: string) => void
    showCheckPoint: () => void
}

function RaceTheme(props: Props) {
    const [ghosts, setGhosts] = useState<Ghost[]>([])

    useEffect(() => {
        socket.emit("getGhostTrains")
    }, [])

    useEffect(() => {
        socket.on("ghost-trains", (ghosts) => {
            const averageGhost = ghosts["avgScore"][0]
            const bestGhost = ghosts["bestScore"][0]

            const newGhosts = [
                {
                    score: averageGhost["averageScore"],
                    teamName: "AverageJoes",
                },
                {
                    score: bestGhost["maxScore"],
                    teamName: bestGhost["teamName"],
                },
            ]

            setGhosts((curr) => [...newGhosts])
        })
    }, [socket])

    return (
        <div>
            {props.selectedTheme.toLowerCase() == "train" ? (
                <TrainTheme
                    data-testid={"train-theme"}
                    ghosts={ghosts}
                    mapDimensions={props.mapDimensions}
                    maxPoints={props.maxPoints}
                    averageGoalPoints={props.averageGoalPoints}
                    currentPoints={props.currentPoints}
                    checkpoints={props.checkpoints}
                    usedTime={props.usedTime}
                    setCheckpoint={props.setCheckpoint}
                    showCheckPoint={props.showCheckPoint}
                ></TrainTheme>
            ) : null}

            {props.selectedTheme.toLowerCase() == "boat" ? (
                <BoatTheme
                    ghosts={ghosts}
                    data-testid={"boat-theme"}
                    mapDimensions={props.mapDimensions}
                    maxPoints={props.maxPoints}
                    averageGoalPoints={props.averageGoalPoints}
                    currentPoints={props.currentPoints}
                    checkpoints={props.checkpoints}
                    usedTime={props.usedTime}
                    setCheckpoint={props.setCheckpoint}
                    showCheckPoint={props.showCheckPoint}
                ></BoatTheme>
            ) : null}
        </div>
    )
}

export default RaceTheme
