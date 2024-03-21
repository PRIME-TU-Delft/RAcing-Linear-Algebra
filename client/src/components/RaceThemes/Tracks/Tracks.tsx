import React, { useEffect, useState } from "react"
import TrainSprites from "../Sprites/TrainThemeSprites"
import BoatSprites from "../Sprites/BoatThemeSprites"

import "./Tracks.css"
import { color, motion } from "framer-motion"
import {
    PercentCoordinate,
    Ghost,
    RaceObject,
    Point,
    Checkpoint,
    Component,
    Dimensions,
} from "../SharedUtils"
import {formatRacePositionText, getColorForRaceLap, getRaceVehicleSprite, getZIndexValues} from "../RaceService"
import Checkpoints from "../Checkpoints/Checkpoints"
import Ghosts from "../Ghosts/Ghosts"
import RacePath from "./RacePath/RacePath"
import VehicleImage from "../VehicleImage/VehicleImage"
import TracksStyle from "./TracksStyle"
import { a, useSpring, useTransition } from "react-spring"

interface Props {
    theme: string   // theme for the race (e.g. train, boat...)
    mapDimensions: Dimensions // width and height of the map
    trackPoints: PercentCoordinate[] // list of path corner points
    totalPoints: number // number of points needed to complete the map section
    currentPoints: number // current points of the team
    usedTime: number    // current round time
    checkpoints: Checkpoint[] // list of checkpoints
    ghosts: Ghost[] // list of ghost teams
}

function Tracks(props: Props) {
    const height = props.mapDimensions.height
    const width = props.mapDimensions.width
    const [progressPercent, setProgressPercent] = useState(0) // percent of team progress, initialized at 0%
    const [racingTeamStats, setRacingTeamStats] = useState<RaceObject[]>([])
    const [sortedRacingTeamStats, setSortedRacingTeamStats] = useState<RaceObject[]>([])

    useEffect(() => {
        const newRacingTeams: RaceObject[] = []

        // Adding the main train
        newRacingTeams.push({
            isGhost: false,
            score: 0
        })

        // Adding the ghost teams
        for (const ghost of props.ghosts) {
            newRacingTeams.push({
                isGhost: true,
                ghostKey: ghost.key,
                score: 0
            })
        }

        setRacingTeamStats(curr => [...newRacingTeams])
        setSortedRacingTeamStats(curr => [...newRacingTeams])
    }, [props.ghosts])

    useEffect(() => {
        const newOrderOfTeams = [...racingTeamStats]
        newOrderOfTeams.sort((x, y) => x.score > y.score ? -1 : x.score < y.score ? 1 : 0)
        setSortedRacingTeamStats(curr => [...newOrderOfTeams])

        props.ghosts.forEach(ghost => {
            const position = newOrderOfTeams.findIndex(x => x.ghostKey == ghost.key)
            ghost.racePosition = position
        })

    }, [racingTeamStats])

    const updateRacingStats = (newScore: number, ghostKey?: number) => {
        if (racingTeamStats.length == 0) return
        
        const newStats = [...racingTeamStats]

        let indexToUpdate = -1

        // Only ghost teams have a ghost index
        if (ghostKey != undefined) {
            indexToUpdate = newStats.findIndex(x => x.ghostKey == ghostKey)   // find element representing ghost which had a change in score
        }
        else {
            indexToUpdate = newStats.findIndex(x => !x.isGhost)   // only one team is not a ghost (playing team)
        }

        if (indexToUpdate != -1) {
            newStats[indexToUpdate].score = newScore
        }
        setRacingTeamStats(curr => [...newStats])
    }

    const points: Point[] = [] // list of points computed from track coordinates
    let svgPath = "M" // svg path that the team takes

    // Transform coordinates into points and generate the svg path from said points
    for (let i = 0; i < props.trackPoints.length; i++) {
        points.push(
            new Point(
                props.trackPoints[i].xPercent * width,
                props.trackPoints[i].yPercent * height
            )
        )

        if (i != 0) svgPath += "L" // L means move to coordinates x y, e.g. L 1 2
        svgPath +=
            (points[i].x + 20).toString() +
            " " +
            (height - points[i].y - 20).toString() +
            " "
    }

    const components: Component[] = []
    let tracksLength = 0

    for (let i = 0; i < points.length - 1; i++) {
        let direction = "vertical"
        if (points[i].x != points[i + 1].x) direction = "horizontal"

        components.push(new Component(points[i], points[i + 1], direction))
        tracksLength += components[i].length
    }

    // Updates progress percent when points increase
    useEffect(() => {
        setProgressPercent((current) => (props.currentPoints % props.totalPoints) / props.totalPoints)
        updateRacingStats(props.currentPoints)
    }, [props.currentPoints])

    const getCheckpointSprite = () => {
        switch(props.theme) {
            case "train":
                return TrainSprites.trainStation
            case "boat":
                return BoatSprites.islandIcon
            default:
                return TrainSprites.trainStation
        }
    }

    const getRacePosition = (ghostKey?: number) => {
        let positionIndex = -1

        if (ghostKey != undefined) {
            positionIndex = sortedRacingTeamStats.findIndex(x => x.ghostKey == ghostKey)   // using the ghost's index to find position in the race
        }
        else {
            positionIndex = sortedRacingTeamStats.findIndex(x => !x.isGhost)   // playing team is the only non-ghost in the array
        }

        return positionIndex
    }

    const getRacePositionText = (ghostKey?: number) => {
        const positionIndex = getRacePosition(ghostKey)
        if (positionIndex != -1) return formatRacePositionText(positionIndex + 1)
        else return ""
    }

    const getNumberOfRaceLapsCompleted = (totalPoints: number, currentPoints: number) => {
        return Math.floor(currentPoints / totalPoints)
    }

    return (
        <div>
            <RacePath
                theme={props.theme}
                components={components}
                svgPath={svgPath}></RacePath>

            <Checkpoints
                checkpoints={props.checkpoints}
                sprite={getCheckpointSprite()}
                pathLength={tracksLength}
                totalPoints={props.totalPoints}
                components={components}
            ></Checkpoints>

            {/* {lapCompletedTextAnimation((style, item) => (
                <div style={TracksStyle.getLapCompletedTextPosition(components[components.length - 1])}>
                    <a.div style={style} className="lap-completed-text">Completed!</a.div>
                </div>
            ))} */}

            {/* Displays the main vehicle, representing the team currently playing */}
            <motion.div
                data-testid={"main-vehicle"}
                className="main-vehicle"
                style={{ 
                    offsetPath: `path("${svgPath}")`,
                    zIndex: getZIndexValues().mainVehicle
                }}
                initial={{ offsetDistance: "0%"}}
                animate={{ 
                    offsetDistance: `${progressPercent * 100}%`
                }}
                transition={{
                    ease: "easeInOut",
                    duration: 2,
                    stiffness: 100,
                }}
            >
                <div className="main-vehicle-position-number main-vehicle-text" style={{zIndex: getZIndexValues().mainVehicle + 20}}>{getRacePositionText()}</div>
                <div className="vehicle-image-container" style={{ borderColor: getColorForRaceLap(getNumberOfRaceLapsCompleted(props.totalPoints, props.currentPoints)) }}>
                    <VehicleImage 
                        theme={props.theme} 
                        colors={{
                            mainColor: "#0021A7",
                            highlightColor: "#F8B700"
                        }} />
                </div>
            </motion.div>

            <Ghosts
                    data-testid={"ghosts"}
                    ghosts={props.ghosts}
                    time={props.usedTime}
                    path={svgPath}
                    theme={props.theme}
                    totalPoints={props.totalPoints}
                    mainVehiclePosition={getRacePosition()}
                    onGhostScoreUpdate={(newScore, ghostKey) => updateRacingStats(newScore, ghostKey)}
                />
        </div>
    )
}

export default Tracks
