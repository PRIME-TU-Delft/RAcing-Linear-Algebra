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
        socket.emit("getGhostTeams")
    }, [props.averageGoalPoints])

    useEffect(() => {
        socket.on("ghost-teams", (ghosts) => {
            const ghostsWithColor: Ghost[] = ghosts.map(
                (x: { teamName: string; timeScores: { timePoint: number, score: number }; checkpoints: number[]; study: string; accuracy: number }) => ({
                    ...x,
                    color: "#" + Math.random().toString(16).substring(2, 8)
                }))

            setGhosts((curr) => [...ghostsWithColor])
            console.log(ghosts)
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
