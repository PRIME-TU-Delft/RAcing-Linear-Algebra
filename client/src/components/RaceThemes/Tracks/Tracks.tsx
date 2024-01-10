import React, { useEffect, useState } from "react"
import TrainSprites from "../Sprites/TrainThemeSprites"
import BoatSprites from "../Sprites/BoatThemeSprites"

import "./Tracks.css"
import { motion } from "framer-motion"
import {
    PercentCoordinate,
    Ghost,
    RaceObject,
    Point,
    Checkpoint,
    Component,
    Dimensions,
} from "../SharedUtils"
import {formatRacePositionText} from "../RaceService"
import Checkpoints from "../Checkpoints/Checkpoints"
import Ghosts from "../Ghosts/Ghosts"
import RacePath from "./RacePath/RacePath"

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
    const [racingTeamsStats, setRacingTeamsStats] = useState<RaceObject[]>([])
    const [sortedRacingTeamStats, setSortedRacingTeamStats] = useState<RaceObject[]>([])

    useEffect(() => {
        const newRacingTeams: RaceObject[] = []
        for (let i = 0; i < props.ghosts.length; i++) {
            newRacingTeams.push({
                isGhost: true,
                ghostIndex: i,
                score: 0
            })
        }
        newRacingTeams.push({
            isGhost: false,
            score: 0
        })
        setRacingTeamsStats(curr => [...newRacingTeams])
        setSortedRacingTeamStats(curr => [...newRacingTeams])
    }, [props.ghosts])

    useEffect(() => {
        const newOrderOfTeams = [...racingTeamsStats]
        newOrderOfTeams.sort((x, y) => x.score > y.score ? -1 : x.score < y.score ? 1 : 0)
        setSortedRacingTeamStats(curr => [...newOrderOfTeams])
    }, [racingTeamsStats])

    const updateRacingStats = (newScore: number, ghostIndex?: number) => {
        const newStats = [...racingTeamsStats]

        let indexToUpdate = -1

        // Only ghost teams have a ghost index
        if (ghostIndex != undefined) {
            indexToUpdate = newStats.findIndex(x => x.ghostIndex == ghostIndex)   // find element representing ghost which had a change in score
        }
        else {
            indexToUpdate = newStats.findIndex(x => !x.isGhost)   // only one team is not a ghost (playing team)
        }

        if (indexToUpdate != -1) {
            newStats[indexToUpdate].score = newScore
        }
        console.log(newStats)
        setRacingTeamsStats(curr => [...newStats])
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
        console.log(props.currentPoints)
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

    const getVehicleSprite = () => {
        switch(props.theme) {
            case "train":
                return TrainSprites.train
            case "boat":
                return BoatSprites.boat
            default:
                return TrainSprites.train
        }
    }

    const getRacePosition = (ghostIndex?: number) => {
        let positionIndex = -1

        if (ghostIndex != undefined) {
            positionIndex = sortedRacingTeamStats.findIndex(x => x.ghostIndex == ghostIndex)   // using the ghost's index to find position in the race
        }
        else {
            positionIndex = sortedRacingTeamStats.findIndex(x => !x.isGhost)   // playing team is the only non-ghost in the array
        }

        return positionIndex
    }

    const getRacePositionText = (ghostIndex?: number) => {
        const positionIndex = getRacePosition(ghostIndex)
        if (positionIndex != -1) return formatRacePositionText(positionIndex + 1)
        else return ""
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

            {/* Displays the main vehicle, representing the team currently playing */}
            <motion.div
                data-testid={"main-vehicle"}
                className="main-vehicle"
                style={{ offsetPath: `path("${svgPath}")` }}
                initial={{ offsetDistance: "0%", filter: "saturate(0.3)" }}
                animate={{ 
                    offsetDistance: `${progressPercent * 100}%`,
                    filter: `saturate(${0.3 + Math.floor(props.currentPoints / props.totalPoints) * 0.6})`
                 }}
                transition={{ duration: 1 }}
            >
                <div className="position-number main-color">{getRacePositionText()}</div>
                <img
                    src={getVehicleSprite()}
                    alt="vehicle"
                    className="rounded-circle progress-point"
                />
            </motion.div>

            <Ghosts
                    data-testid={"ghosts"}
                    ghosts={props.ghosts}
                    time={props.usedTime}
                    path={svgPath}
                    sprite={getVehicleSprite()}
                    totalPoints={props.totalPoints}
                    mainVehiclePosition={getRacePosition()}
                    onGhostScoreUpdate={(newScore, ghostIndex) => updateRacingStats(newScore, ghostIndex)}
                    getRacePosition={(ghostIndex: number) => getRacePosition(ghostIndex)}
                />
        </div>
    )
}

export default Tracks
