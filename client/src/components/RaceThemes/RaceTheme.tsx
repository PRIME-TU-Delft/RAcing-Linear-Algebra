import React, { useEffect, useState } from "react"
import { Checkpoint, Ghost, Map } from "./SharedUtils"
import socket from "../../socket"
import { trainMaps } from "./Maps/TrainMaps"
import { boatMaps } from "./Maps/BoatMaps"

import { a, useSpring } from "react-spring"
import Tracks from "./Tracks/Tracks"
import Decorations from "./Decorations/Decorations"
import CheckpointReached from "./CheckpointAnimation/CheckpointReached"
import ThemeBackground from "./ThemeBackground/ThemeBackground"
import "./RaceTheme.css"
interface Props {
    mapDimensions: {
        width: number // screen width of map section
        height: number // screen height of map section
    }
    currentPoints: number
    checkpoints: Checkpoint[]
    usedTime: number
    selectedTheme: string
    setCheckpoint: (data: string) => void
    showCheckPoint: () => void
}

function RaceTheme(props: Props) {
    const [ghosts, setGhosts] = useState<Ghost[]>([])
    const [averageFinalTeamScore, setAverageFinalTeamScore] = useState<number>(0)
    const [nextCheckpoint, setNextCheckpoint] = useState(props.checkpoints[0]) // next checkpoint to be reached
    const [checkpointReached, setCheckpointReached] = useState(false) // boolean indicating whether a checkpoint has been reached
    
    const height = props.mapDimensions.height
    const width = props.mapDimensions.width
    
    const testGhosts: Ghost[] = [{
        teamName: "Test",
        color: "#" + Math.random().toString(16).substring(2, 8),
        timeScores: [],
        checkpoints: [],
        study: "CSE",
        accuracy: 100,
        animationStatus: {
            pathProgress: 0,    // initialize all ghost to progress of 0%
                        transitionDuration: 1,  // transition duration initalized at 1, changes when updating
                        timeScoreIndex: 0  
        }
    }]

    function getThemeMaps(theme: string) {
        switch (theme) {
            case "train": return trainMaps

            case "boat": return boatMaps

            default: return trainMaps
        }
    }
    const selectedMap = getThemeMaps(props.selectedTheme)[0] // multiple maps may be used in the future, currently only one exists

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
    
    useEffect(() => {
        if (averageFinalTeamScore == 0) socket.emit("getRaceTrackEndScore")
        socket.emit("getGhostTeams")
    }, [averageFinalTeamScore])

    useEffect(() => {
        socket.on("ghost-teams", (ghosts) => {
            const ghostsWithColor: Ghost[] = ghosts.map(
                (x: { teamName: string; timeScores: { timePoint: number, score: number }; checkpoints: number[]; study: string; accuracy: number }) => ({
                    ...x,
                    color: "#" + Math.random().toString(16).substring(2, 8),
                    animationStatus: {
                        pathProgress: 0,    // initialize all ghost to progress of 0%
                        transitionDuration: 1,  // transition duration initalized at 1, changes when updating
                        timeScoreIndex: 0   // intialize index to 0, so the ghost first aims to reach its first time score
                    }
                }))

            setGhosts((curr) => [...ghostsWithColor])
            console.log(ghosts)
        })

        socket.on("race-track-end-score", (score: number) => {
            setAverageFinalTeamScore(curr => score)
            console.log(score)
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
                <Tracks
                    theme={props.selectedTheme}
                    totalPoints={averageFinalTeamScore}
                    currentPoints={props.currentPoints}
                    ghosts={ghosts}
                    usedTime={props.usedTime}
                    mapDimensions={props.mapDimensions}
                    trackPoints={selectedMap.path}
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

            <ThemeBackground theme={props.selectedTheme}></ThemeBackground>

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

export default RaceTheme
