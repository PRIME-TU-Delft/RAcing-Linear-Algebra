import React, { useEffect, useState } from "react"
import Sprites from "../TrainThemeSprites"
import Style from "./TracksStyle"
import "./Tracks.css"
import Position from "../../PathPosition"
import { motion } from "framer-motion"
import {
    PercentCoordinate,
    Ghost,
    Point,
    Checkpoint,
    Component,
    Dimensions,
} from "../../SharedUtils"
import Checkpoints from "../../Checkpoints/Checkpoints"
import Ghosts from "../../Ghosts/Ghosts"
import BestGhost from "../../Ghosts/BestGhost"

interface Props {
    mapDimensions: Dimensions // width and height of the map
    trackPoints: PercentCoordinate[] // list of path corner points
    totalPoints: number // number of points needed to complete the map section
    currentPoints: number // current points of the team
    checkpoints: Checkpoint[] // list of checkpoints
    ghostTrains: Ghost[] // list of ghost boats
    finalSection: boolean // boolean to indicate whether this is the final section of the map
    onSectionComplete: () => void // event called when the end of the map is reached
}

function Tracks(props: Props) {
    const height = props.mapDimensions.height
    const width = props.mapDimensions.width
    const [progressPercent, setProgressPercent] = useState(0) // percent of train progress, initialized at 0%
    const [ghostColors, setGhostColors] = useState<string[]>([]) // randomized colors for the ghost trains

    const points: Point[] = [] // list of points computed from track coordinates
    let svgPath = "M" // svg path that the train takes

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
        setProgressPercent((current) => props.currentPoints / props.totalPoints)
        if (props.currentPoints >= props.totalPoints) props.onSectionComplete()
    }, [props.currentPoints])

    // Generates ghost train colors on load
    useEffect(() => {
        const newColors = props.ghostTrains.map(
            (val) => "#" + Math.random().toString(16).substring(2, 8)
        )
        setGhostColors((curr) => newColors)
    }, [props.ghostTrains])

    return (
        <div>
            {/* Displays the train tracks from the list of components */}
            {components.map((component) => (
                <div key={components.indexOf(component)}>
                    <div
                        style={Style.createComponentStyle(
                            component.start,
                            component.end,
                            components.indexOf(component) == 0
                        )}
                    ></div>
                    <div
                        style={Style.createRailTurnComponentStyle(
                            components.indexOf(component),
                            components
                        )}
                    ></div>
                </div>
            ))}

            <Checkpoints
                checkpoints={props.checkpoints}
                sprite={Sprites.trainStation}
                pathLength={tracksLength}
                totalPoints={props.totalPoints}
                components={components}
            ></Checkpoints>

            {/* Displays the main train, representing the team currently playing */}
            <motion.div
                data-testid={"main-train"}
                className="progress-point rounded-circle main-train"
                style={{ offsetPath: `path("${svgPath}")` }}
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: `${progressPercent * 100}%` }}
                transition={{ duration: 10 }}
            >
                <img
                    src={Sprites.train}
                    alt="train"
                    className="rounded-circle"
                />
            </motion.div>

            {props.finalSection ? (
                <BestGhost
                    data-testid={"best-ghost"}
                    bestGhost={props.ghostTrains[1]}
                    totalPoints={props.totalPoints}
                    path={svgPath}
                    sprite={Sprites.train}
                />
            ) : (
                <Ghosts
                    data-testid={"ghosts"}
                    ghosts={props.ghostTrains}
                    totalPoints={props.totalPoints}
                    colors={ghostColors}
                    path={svgPath}
                    sprite={Sprites.train}
                />
            )}
        </div>
    )
}

export default Tracks
