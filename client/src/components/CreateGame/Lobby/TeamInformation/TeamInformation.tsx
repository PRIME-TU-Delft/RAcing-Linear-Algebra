import React, { useEffect, useState } from "react"
import "./TeamInformation.css"

interface Props {
    playerNumber: number
    teamName: string
}

function TeamInformation(props: Props) {
    const numberOfPlayersHandler = () => {
        if (props.playerNumber == 1) return "1 player"
        else return props.playerNumber.toString() + " players"
    }

    return (
        <div className="information col align-middle">
            <div className="team-name">
                Team name: <span>{props.teamName}</span>
            </div>
            <div className="players">{numberOfPlayersHandler()}</div>
        </div>
    )
}

export default TeamInformation
