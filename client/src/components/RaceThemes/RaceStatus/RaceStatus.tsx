import React, { useContext, useEffect, useState } from "react";
import "./RaceStatus.css"
import { RaceDataContext } from "../../../contexts/RaceDataContext";
import { ScoreContext } from "../../../contexts/ScoreContext";
import { RaceObject } from "../SharedUtils";
import { currentGhostIsOpen } from "../Ghosts/GhostService";
import { formatRacePositionText, getColorForRaceLap, getZIndexValues } from "../RaceService";
import Ghosts from "../Ghosts/Ghosts";
import VehicleImage from "../VehicleImage/VehicleImage";
import { motion } from "framer-motion";
import { RacePathContext } from "../../../contexts/RacePathContext";
import MainVehicle from "./MainVehicle/MainVehicle";

interface Props {
    keepClosed: boolean
}

function RaceStatus(props: Props) {
    const raceData = useContext(RaceDataContext)
    const scores = useContext(ScoreContext)
    const racePath = useContext(RacePathContext)

    const [progressPercent, setProgressPercent] = useState(0) // percent of team progress, initialized at 0%
    const [mainVehiclePosition, setMainVehiclePosition] = useState(0) // position of the team
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
        for (const ghost of raceData.ghostTeams) {
            newRacingTeams.push({
                isGhost: true,
                ghostKey: ghost.key,
                score: 0
            })
        }

        setRacingTeamStats(curr => [...newRacingTeams])
        setSortedRacingTeamStats(curr => [...newRacingTeams])
    }, [raceData.ghostTeams])

    useEffect(() => {
        const newOrderOfTeams = [...racingTeamStats]
        newOrderOfTeams.sort((x, y) => x.score > y.score ? -1 : x.score < y.score ? 1 : 0)
        setSortedRacingTeamStats(curr => [...newOrderOfTeams])

    }, [racingTeamStats])

    useEffect(() => {
        const newMainTeamPosition = getRacePosition()
        raceData.ghostTeams.forEach(ghost => {
            const position = getRacePosition(ghost.key)
            ghost.racePosition = position
            ghost.isOpen = currentGhostIsOpen(position, newMainTeamPosition)
        })
        setMainVehiclePosition(curr => newMainTeamPosition)
    }, [sortedRacingTeamStats])

    // Updates progress percent when points increase
    useEffect(() => {
        setProgressPercent((current) => (scores.currentPoints % scores.totalPoints) / scores.totalPoints)
        updateRacingStats(scores.currentPoints)
    }, [scores.currentPoints])

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

    return(
        <div>
            <MainVehicle 
                racePosition={mainVehiclePosition}
                progressPercent={progressPercent}
                path={racePath.svgPath}
                isOnMinimap={props.keepClosed}
            ></MainVehicle>

            <Ghosts
                    data-testid={"ghosts"}
                    path={racePath.svgPath}
                    keepClosed={props.keepClosed}
                    onGhostScoreUpdate={(newScore, ghostKey) => updateRacingStats(newScore, ghostKey)}
                />
        </div>
    )
}

export default RaceStatus