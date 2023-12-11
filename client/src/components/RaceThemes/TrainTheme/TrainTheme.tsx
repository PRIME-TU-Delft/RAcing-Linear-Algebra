import React, { useEffect, useState } from "react"
import "./TrainTheme.css"
import Tracks from "./Tracks/Tracks"
import socket from "../../../socket"
import Sprites from "./TrainThemeSprites"
import DecorationsEditor from "../DecorationsEditor/DecorationsEditor"
import { maps } from "../Maps/TrainMaps"
import Decorations from "../Decorations/Decorations"
import CheckpointReached from "../CheckpointAnimation/CheckpointReached"
import { a, useSpring } from "react-spring"
import { Checkpoint, Dimensions, Ghost } from "../SharedUtils"

interface Props {
    mapDimensions: Dimensions // width and height of the map
    maxPoints: number // maximum points obtainable
    currentPoints: number // current points of the team
    checkpoints: Checkpoint[] // list of checkpoints
    ghosts: Ghost[] // list of ghosts to show previous team progress
    usedTime: number // time used so far
    setCheckpoint: (data: string) => void // event called when a checkpoint is reached
    showCheckPoint: () => void // event called to show a checkpoint when it is reached
}

function TrainTheme(props: Props) {
    const height = props.mapDimensions.height
    const width = props.mapDimensions.width

    const [nextCheckpoint, setNextCheckpoint] = useState(props.checkpoints[0]) // next checkpoint to be reached
    const [checkpointReached, setCheckpointReached] = useState(false) // boolean indicating whether a checkpoint has been reached
    const selectedMap = maps[0] // multiple maps may be used in the future, currently only one exists

    // Fade animation for changing map sections (entrance and leave animation), created using react-spring
    const fadeSection = useSpring({
        config: { mass: 2, friction: 40, tension: 170 },
        from: { opacity: checkpointReached ? 1 : 0.4 },
        to: { opacity: checkpointReached ? 0.4 : 1 },
    })

    // When the team points are updated, checks whether a checkpoint is reached and records the team's time for reaching it
    useEffect(() => {
        if (
            props.currentPoints >= nextCheckpoint.points
        ) {
            const nextCheckpointName = nextCheckpoint.name
            props.setCheckpoint(nextCheckpointName)
            if (!checkpointReached) {
                socket.emit("addCheckpoint", props.usedTime)
                setCheckpointReached((val) => true)
            }

            setTimeout(() => {
                const filteredCheckpoints = props.checkpoints.filter(
                    (checkpoint) => checkpoint.points > props.currentPoints
                )
                if (filteredCheckpoints.length > 0)
                    setNextCheckpoint((val) => filteredCheckpoints[0])

                setCheckpointReached((val) => false)
                props.showCheckPoint()
            }, 3000)
        }
    }, [props.currentPoints])

    return (
        <a.div
            className="race-map"
            style={{
                ...fadeSection,
                backgroundColor:
                    selectedMap.backgroundColor,
            }}
        >

            <a.div
                data-testid={"map"}
                className="map-content"
                style={{ ...fadeSection }}
            >
                <Tracks
                    totalPoints={props.maxPoints}
                    currentPoints={props.currentPoints}
                    ghostTrains={props.ghosts}
                    usedTime={props.usedTime}
                    mapDimensions={props.mapDimensions}
                    trackPoints={selectedMap.tracks}
                    checkpoints={props.checkpoints}
                ></Tracks>
                <Decorations
                    mapDimensions={{ width: width, height: height }}
                    decorationsList={selectedMap.decorations}
                ></Decorations>
            </a.div>

            {/* Animation for reaching a checkpoint, lasts 3 seconds */}
            <CheckpointReached
                open={checkpointReached}
                checkpointText={nextCheckpoint.name.split(" ")}
            ></CheckpointReached>

            {/* NOTE: Uncomment the following component to enable the map editor; an interactive tool for designing new maps. Make sure to comment out the <Decorations> component above, to have an empty map to work with.*/}
            {/* <DecorationsEditor 
            mapDimensions={props.mapDimensions}
            decorationsList={[
                {class: "tree", sprite: Sprites.treeOne, dimensions: {height: 80, width: 100}},
                {class: "tree", sprite: Sprites.treeTwo, dimensions: {height: 80, width: 100}},
                {class: "tree", sprite: Sprites.treeThree, dimensions: {height: 80, width: 100}}, 
                {class: "lake", sprite: Sprites.lakeOne, dimensions: {height: 100, width: 100}},
                {class: "lake", sprite: Sprites.lakeTwo, dimensions: {height: 100, width: 71} },
                {class: "windmill", sprite: Sprites.windmill, dimensions: {height: 250, width: 250}}
            ]}></DecorationsEditor> */}
        </a.div>
    )
}

export default TrainTheme
