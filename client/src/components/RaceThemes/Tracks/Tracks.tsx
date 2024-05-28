import React, { useContext, useEffect, useState } from "react"
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
    RacePathObject,
} from "../SharedUtils"
import {formatRacePositionText, getColorForRaceLap, getRaceVehicleSprite, getZIndexValues} from "../RaceService"
import Checkpoints from "../Checkpoints/Checkpoints"
import Ghosts from "../Ghosts/Ghosts"
import RacePath from "./RacePath/RacePath"
import VehicleImage from "../VehicleImage/VehicleImage"
import TracksStyle from "./TracksStyle"
import { a, useSpring, useTransition } from "react-spring"
import { RaceDataContext } from "../../../contexts/RaceDataContext"
import { ScoreContext } from "../../../contexts/ScoreContext"
import { currentGhostIsOpen } from "../Ghosts/GhostService"
import { RacePathContext } from "../../../contexts/RacePathContext"

function Tracks() {
    const raceData = useContext(RaceDataContext)
    const scores = useContext(ScoreContext)
    const racePath = useContext(RacePathContext)

    const getCheckpointSprite = () => {
        switch(raceData.theme) {
            case "train":
                return TrainSprites.trainStation
            case "boat":
                return BoatSprites.islandIcon
            default:
                return TrainSprites.trainStation
        }
    }

    return (
        <div>
            <RacePath
                theme={raceData.theme}
                components={racePath.components}
                svgPath={racePath.svgPath}></RacePath>

            <Checkpoints
                checkpoints={raceData.checkpoints}
                sprite={getCheckpointSprite()}
                pathLength={racePath.pathLength}
                totalPoints={scores.totalPoints}
                components={racePath.components}
            ></Checkpoints>
        </div>
    )
}

export default Tracks
