import React, { useEffect, useState } from "react"
import "./BoatTheme.css"
import socket from "../../../socket"
import DecorationsEditor from "../DecorationsEditor/DecorationsEditor"
import { maps } from "../Maps/BoatMaps"
import Decorations from "../Decorations/Decorations"
import { a, useSpring } from "react-spring"
import Path from "./Path/Path"
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

function BoatTheme(props: Props) {
    const height = props.mapDimensions.height
    const width = props.mapDimensions.width

    const [nextCheckpoint, setNextCheckpoint] = useState(props.checkpoints[0]) // next checkpoint to be reached
    const [currentMapSection, setCurrentMapSection] = useState(0) // index of the current section of the map (can be 0 or 1)
    const [checkpointReached, setCheckpointReached] = useState(false) // boolean indicating whether a checkpoint has been reached
    const selectedMap = maps[0] // multiple maps may be used in the future, currently only one exists

    // Fade animation for the map when a checkpoint is reached, created using react-spring
    const fadeMap = useSpring({
        config: { mass: 2, friction: 40, tension: 170 },
        from: {
            opacity:
                currentMapSection == 0 &&
                props.currentPoints >= props.maxPoints &&
                !checkpointReached
                    ? 1
                    : 0.4,
        },
        to: {
            opacity:
                currentMapSection == 0 &&
                props.currentPoints >= props.maxPoints &&
                !checkpointReached
                    ? 0.4
                    : 1,
        },
    })

    // Fade animation for changing map sections (entrance and leave animation), created using react-spring
    const fadeSection = useSpring({
        config: { mass: 2, friction: 40, tension: 170 },
        from: { opacity: checkpointReached ? 1 : 0.4 },
        to: { opacity: checkpointReached ? 0.4 : 1 },
    })

    // Called when a section of the map is finished
    const sectionCompleteHandler = () => {
        setCurrentMapSection((curr) => 1)
    }

    // When the team points are updated, checks whether a checkpoint is reached and records the team's time for reaching it
    useEffect(() => {
        if (
            currentMapSection == 0 && // checkpoints exist only on the initial map section
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
                ...fadeMap,
                backgroundColor:
                    selectedMap.backgroundColor,
            }}
        >
            <a.div
                data-testid={"map"}
                className="map-content"
                style={{ ...fadeSection }}
            >
                <Path
                    checkpoints={props.checkpoints}
                    onSectionComplete={sectionCompleteHandler}
                    totalPoints={props.maxPoints}
                    currentPoints={props.currentPoints}
                    ghostBoats={props.ghosts}
                    usedTime={props.usedTime}
                    finalSection={currentMapSection == 1}
                    mapDimensions={props.mapDimensions}
                    trackPoints={selectedMap.path}
                ></Path>

                <Decorations
                    mapDimensions={{ width: width, height: height }}
                    decorationsList={selectedMap.decorations}
                ></Decorations>
            </a.div>
            <div className="waves">
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
            </div>
        </a.div>
    )
}

export default BoatTheme
