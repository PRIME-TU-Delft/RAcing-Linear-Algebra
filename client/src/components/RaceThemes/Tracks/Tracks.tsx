import React, { useEffect, useState } from "react"
import TrainSprites from "../Sprites/TrainThemeSprites"
import BoatSprites from "../Sprites/BoatThemeSprites"

import Style from "./TracksStyle"
import "./Tracks.css"
import { motion } from "framer-motion"
import {
    PercentCoordinate,
    Ghost,
    Point,
    Checkpoint,
    Component,
    Dimensions,
} from "../SharedUtils"
import Checkpoints from "../Checkpoints/Checkpoints"
import Ghosts from "../Ghosts/Ghosts"
import RacePath from "./RacePath"

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
        console.log(props.totalPoints)
        setProgressPercent((current) => (props.currentPoints % props.totalPoints) / props.totalPoints)
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
                className="progress-point rounded-circle main-vehicle"
                style={{ offsetPath: `path("${svgPath}")` }}
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: `${progressPercent * 100}%` }}
                transition={{ duration: 5 }}
            >
                <img
                    src={getVehicleSprite()}
                    alt="vehicle"
                    className="rounded-circle"
                />
            </motion.div>

            <Ghosts
                    data-testid={"ghosts"}
                    ghosts={props.ghosts}
                    time={props.usedTime}
                    path={svgPath}
                    sprite={getVehicleSprite()}
                    totalPoints={props.totalPoints}
                />
        </div>
    )
}

export default Tracks
