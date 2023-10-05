import React, { useEffect, useState } from "react"
import Sprites from "../BoatThemeSprites"
import "./Path.css"
import Checkpoints from "../../Checkpoints/Checkpoints"
import { motion } from "framer-motion"
import BestGhost from "../../Ghosts/BestGhost"
import Ghosts from "../../Ghosts/Ghosts"
import {
    Checkpoint,
    Dimensions,
    Point,
    Component,
    Ghost,
    PercentCoordinate,
} from "../../SharedUtils"

interface Props {
    mapDimensions: Dimensions // width and height of the map
    trackPoints: PercentCoordinate[] // list of path corner points
    totalPoints: number // number of points needed to complete the map section
    currentPoints: number // current points of the team
    checkpoints: Checkpoint[] // list of checkpoints
    ghostBoats: Ghost[] // list of ghost boats
    finalSection: boolean // boolean to indicate whether this is the final section of the map
    onSectionComplete: () => void // event called when the end of the map is reached
}

function Path(props: Props) {
    const height = props.mapDimensions.height
    const width = props.mapDimensions.width

    const [progressPercent, setProgressPercent] = useState(0) // percent of train progress, initialized at 0%
    const [ghostColors, setGhostColors] = useState<string[]>([]) // randomized colors for the ghost trains

    const points: Point[] = [] // list of points computed from track coordinates
    let svgPath = "M" // svg path that the train takes
    let checkpointPath = "M" // svg path for the checkpoints

    // Transform coordinates into points and generate the svg path from said points
    for (let i = 0; i < props.trackPoints.length; i++) {
        points.push(
            new Point(
                props.trackPoints[i].xPercent * width,
                props.trackPoints[i].yPercent * height
            )
        )
        if (i != 0) {
            svgPath += "L" // L means move to coordinates x y, e.g. L 1 2
            checkpointPath += "L"
        }
        svgPath +=
            points[i].x.toString() +
            " " +
            (height - points[i].y).toString() +
            " "
    }

    const components: Component[] = [] // list of track components, each having a starting and ending points
    let tracksLength = 0 // total tracks length

    // Generates track components from the list of points
    for (let i = 0; i < points.length - 1; i++) {
        let direction = "vertical"
        if (points[i].x != points[i + 1].x) direction = "horizontal"

        components.push(new Component(points[i], points[i + 1], direction))
        tracksLength += components[i].length
    }

    // Updates progress percent when points increase
    useEffect(() => {
        setProgressPercent((current) => props.currentPoints / props.totalPoints)
        if (props.currentPoints >= props.totalPoints) props.onSectionComplete()
    }, [props.currentPoints])

    // Generates ghost train colors on load
    useEffect(() => {
        const newColors = props.ghostBoats.map(
            (val) => "#" + Math.random().toString(16).substring(2, 8)
        )
        setGhostColors((curr) => newColors)
    }, [props.ghostBoats])

    return (
        <div>
            {/* Displays the path for the boat */}
            <svg className="svg-path">
                <path
                    d={svgPath}
                    fill={"none"}
                    strokeWidth={4}
                    strokeDasharray={"15"}
                    stroke={"#0C2340"}
                />
            </svg>

            <Checkpoints
                checkpoints={props.checkpoints}
                sprite={Sprites.islandIcon}
                pathLength={tracksLength}
                totalPoints={props.totalPoints}
                components={components}
            ></Checkpoints>

            <motion.div
                data-testid={"main-boat"}
                className="progress-point rounded-circle main-boat"
                style={{ offsetPath: `path("${svgPath}")` }}
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: `${progressPercent * 100}%` }}
                transition={{ duration: 10 }}
            >
                <img src={Sprites.boat} alt="boat" className="rounded-circle" />
            </motion.div>

            {props.finalSection ? (
                <BestGhost
                    data-testid={"best-ghost"}
                    bestGhost={props.ghostBoats[1]}
                    totalPoints={props.totalPoints}
                    path={svgPath}
                    sprite={Sprites.boat}
                />
            ) : (
                <Ghosts
                    data-testid={"ghosts"}
                    ghosts={props.ghostBoats}
                    totalPoints={props.totalPoints}
                    colors={ghostColors}
                    path={svgPath}
                    sprite={Sprites.boat}
                />
            )}
        </div>
    )
}

export default Path
