import React, { useContext, useEffect, useState } from "react"
import { Checkpoint, Ghost, Map, ServerGhost } from "./SharedUtils"
import socket from "../../socket"
import { trainMaps } from "./Maps/TrainMaps"
import { boatMaps } from "./Maps/BoatMaps"

import { a, useSpring } from "react-spring"
import Tracks from "./Tracks/Tracks"
import Decorations from "./Decorations/Decorations"
import CheckpointReached from "./CheckpointAnimation/CheckpointReached"
import ThemeBackground from "./ThemeBackground/ThemeBackground"
import "./RaceTheme.css"
import { RaceDataContext } from "../../contexts/RaceDataContext"
import { TimeContext } from "../../contexts/TimeContext"
import { ScoreContext } from "../../contexts/ScoreContext"

interface Props {
    currentPoints: number
    setCheckpoint: (data: string) => void
    showCheckPoint: () => void
}

function RaceTheme(props: Props) {
    const raceData = useContext(RaceDataContext)
    const usedTime = useContext(TimeContext)

    const [averageFinalTeamScore, setAverageFinalTeamScore] = useState<number>(0)
    const [nextCheckpoint, setNextCheckpoint] = useState(raceData.checkpoints[0]) // next checkpoint to be reached
    const [checkpointReached, setCheckpointReached] = useState(false) // boolean indicating whether a checkpoint has been reached
    
    const height = raceData.mapDimensions.height
    const width = raceData.mapDimensions.width


    function getThemeMaps(theme: string) {
        switch (theme) {
            case "train": return trainMaps

            case "boat": return boatMaps

            default: return trainMaps
        }
    }
    const selectedMap = getThemeMaps(raceData.theme)[0] // multiple maps may be used in the future, currently only one exists

    // Fade animation for changing map sections (entrance and leave animation), created using react-spring
    const fadeSection = useSpring({
        config: { mass: 2, friction: 40, tension: 170, duration: 1000 },
        from: { opacity: checkpointReached ? 1 : 0 },
        to: { opacity: checkpointReached ? 0 : 1 },
    })

    // When the team points are updated, checks whether a checkpoint is reached and records the team's time for reaching it
    // useEffect(() => {
    //     if (
    //         props.currentPoints % averageFinalTeamScore >= nextCheckpoint.percentage * averageFinalTeamScore
    //     ) {
    //         const nextCheckpointName = nextCheckpoint.name
    //         props.setCheckpoint(nextCheckpointName)
    //         if (!checkpointReached) {
    //             socket.emit("addCheckpoint", props.usedTime)
    //             setCheckpointReached((val) => true)
    //         }

    //         setTimeout(() => {
    //             const filteredCheckpoints = raceData.checkpoints.filter(
    //                 (checkpoint) => checkpoint.percentage * averageFinalTeamScore > props.currentPoints % averageFinalTeamScore
    //             )
    //             if (filteredCheckpoints.length > 0)
    //                 setNextCheckpoint((val) => filteredCheckpoints[0])

    //             setCheckpointReached((val) => false)
    //             props.showCheckPoint()
    //         }, 3000)
    //     }
    // }, [props.currentPoints])
    
    useEffect(() => {
        if (averageFinalTeamScore == 0) socket.emit("getRaceTrackEndScore")
    }, [averageFinalTeamScore])

    useEffect(() => {
        socket.on("race-track-end-score", (score: number) => {
            setAverageFinalTeamScore(curr => score)
        })
    }, [socket])

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
                <ScoreContext.Provider value={{
                    totalPoints: averageFinalTeamScore,
                    currentPoints: props.currentPoints
                }}>
                    <Tracks
                        trackPoints={selectedMap.path}
                    ></Tracks>
                </ScoreContext.Provider>
                <Decorations
                    mapDimensions={{ width: width, height: height }}
                    decorationsList={selectedMap.decorations}
                ></Decorations>
            </a.div>

{/*             
            <StationDisplay
                        fullRacePoints={averageFinalTeamScore}
                        points={props.currentPoints}
                        stations={props.checkpoints}
            ></StationDisplay> */}

            {/* Animation for reaching a checkpoint, lasts 3 seconds */}
            {/* <CheckpointReached
                open={checkpointReached}
                checkpointText={nextCheckpoint.name.split(" ")}
            ></CheckpointReached> */}

            <ThemeBackground theme={raceData.theme}></ThemeBackground>

            {/* NOTE: Uncomment the following component to enable the map editor; an interactive tool for designing new maps. Make sure to comment out the <Decorations> component above, to have an empty map to work with.*/}
            {/* <DecorationsEditor 
            mapDimensions={props.mapDimensions}
            decorationsList={[
                {class: "tree", sprite: TrainThemeSprites.treeOne, dimensions: {height: 80, width: 100}},
                {class: "tree", sprite: TrainThemeSprites.treeTwo, dimensions: {height: 80, width: 100}},
                {class: "tree", sprite: TrainThemeSprites.treeThree, dimensions: {height: 80, width: 100}}, 
                {class: "lake", sprite: TrainThemeSprites.lakeOne, dimensions: {height: 100, width: 100}},
                {class: "lake", sprite: TrainThemeSprites.lakeTwo, dimensions: {height: 100, width: 71} },
                {class: "windmill", sprite: TrainThemeSprites.windmill, dimensions: {height: 250, width: 250}}
            ]}></DecorationsEditor> */}
        </a.div>
    )
}

export default RaceTheme
