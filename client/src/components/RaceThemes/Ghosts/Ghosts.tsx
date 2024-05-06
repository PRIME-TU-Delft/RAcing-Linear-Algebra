import React, { useContext, useEffect, useState } from "react"
import "./Ghosts.css"
import GhostVehicle from "./GhostVehicle/GhostVehicle"
import { RaceDataContext } from "../../../contexts/RaceDataContext"
import { ScoreContext } from "../../../contexts/ScoreContext"
import { TimeContext } from "../../../contexts/TimeContext"

interface Props {
    path: string // svg path for the ghosts to take
    keepClosed: boolean
    onGhostScoreUpdate: (newScore: number, ghostIndex: number) => void  // update function for race score
}

function Ghosts(props: Props) {
    const raceData = useContext(RaceDataContext)
    const scores = useContext(ScoreContext)
    const usedTime = useContext(TimeContext)
    const [showTeamNames, setShowTeamNames] = useState<boolean>(false)  // boolean to indicate whether the ghost team names should be shown in favor of the position for a brief period of time
    const [startShowingGhosts, setStartShowingGhosts] = useState<boolean>(false)    // boolean to begin showing ghosts after the first one moves
    
    const ghostScoreUpdateHandler = (newScore: number, ghostIndex: number) => {
        if (!startShowingGhosts) setStartShowingGhosts(curr => true)
        props.onGhostScoreUpdate(newScore, ghostIndex)
    }

    useEffect(() => {
        // Check whether all data required has been loaded, to prevent errors
        if (!raceData.ghostTeams || raceData.ghostTeams.length == 0 || raceData.ghostTeams[0].timeScores.length == 0) return

        // Every 30 seconds, briefly show the team names of the open ghosts instead of their position number
        if (usedTime % 30 == 0) {
            setShowTeamNames(curr => true)
            setTimeout(() => setShowTeamNames(curr => false), 5000)
        }
    }, [usedTime])

    return (
        <div>
            {raceData.ghostTeams.map((ghost, index) => (
                <GhostVehicle
                    key={index}
                    ghost={ghost}
                    path={props.path}
                    showTeamNames={showTeamNames}
                    totalPoints={scores.totalPoints}
                    startShowingGhosts={startShowingGhosts}
                    theme={raceData.theme}
                    keepClosed={props.keepClosed}
                    onGhostScoreUpdate={(newScore, ghostKey) => ghostScoreUpdateHandler(newScore, ghostKey)}/>
            ))}
        </div>
    )
}

export default Ghosts
