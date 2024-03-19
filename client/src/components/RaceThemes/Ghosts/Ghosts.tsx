import React, { useEffect, useState } from "react"
import { Ghost } from "../SharedUtils"
import { motion } from "framer-motion"
import { useSpring, animated, a, useTransition, useSpringRef } from '@react-spring/web'
import {currentGhostIsOpen, getColorForStudy, getGhostStyle, getRacePositionText} from "./GhostService"
import { getColorForRaceLap, getZIndexValues } from "../RaceService"
import "./Ghosts.css"
import GhostText from "./GhostText/GhostText"
import VehicleImage from "../VehicleImage/VehicleImage"
import LapCompletedText from "./LapCompletedText/LapCompletedText"
import GhostVehicle from "./GhostVehicle/GhostVehicle"

interface Props {
    ghosts: Ghost[] // list of ghosts to display
    path: string // svg path for the ghosts to take
    totalPoints: number // total points required to reach the end of the map
    theme: string // sprite to use for the ghosts icon
    time: number // current round time
    mainVehiclePosition: number // race position of the main (currently playing) team
    onGhostScoreUpdate: (newScore: number, ghostIndex: number) => void  // update function for race score
}

function Ghosts(props: Props) {
    const [showTeamNames, setShowTeamNames] = useState<boolean>(false)  // boolean to indicate whether the ghost team names should be shown in favor of the position for a brief period of time
    const [startShowingGhosts, setStartShowingGhosts] = useState<boolean>(false)    // boolean to begin showing ghosts after the first one moves
    
    useEffect(() => {
        // Check whether all data required has been loaded, to prevent errors
        if (!props.ghosts || props.ghosts.length == 0 || props.ghosts[0].timeScores.length == 0) return

        // Every 30 seconds, briefly show the team names of the open ghosts instead of their position number
        if (props.time % 30 == 0) {
            setShowTeamNames(curr => true)
            setTimeout(() => setShowTeamNames(curr => false), 5000)
        }

        for (let i = 0; i < props.ghosts.length; i++) {
            // Introduce constants to reduce code repetition
            const currentTimeScoreIndex = props.ghosts[i].animationStatus.timeScoreIndex
            const currentGhostTimePoint = props.ghosts[i].timeScores[currentTimeScoreIndex].timePoint

            // If the time matches a ghost's time point, it is time to update its score (make it move)
            if (currentGhostTimePoint == props.time) {  
                if (!startShowingGhosts) setStartShowingGhosts(true)
                props.ghosts[i].animationStatus.updateAnimation = true
            }
        }
    }, [props.time])

    return (
        <div>
            {props.ghosts.map((ghost, index) => (
                <GhostVehicle
                    key={index}
                    ghost={ghost}
                    path={props.path}
                    mainVehiclePosition={props.mainVehiclePosition}
                    showTeamNames={showTeamNames}
                    totalPoints={props.totalPoints}
                    startShowingGhosts={startShowingGhosts}
                    theme={props.theme}
                    onGhostScoreUpdate={(newScore, ghostKey) => props.onGhostScoreUpdate(newScore, ghostKey)}/>
            ))}
        </div>
    )
}

export default Ghosts
