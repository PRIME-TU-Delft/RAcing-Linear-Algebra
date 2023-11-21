import React, { useEffect, useState } from "react";
import "./TeamLeaderboard.css"

interface Props {
    yourTeamData: {teamName: string, teamScore: number}
}

function TeamLeaderboard(props: Props) {
    const [sortedTeams, setSortedTeams] = useState<{teamName: string, teamScore: number}[]>([])
    const templateData = [
        {
            teamName: "Best Team",
            teamScore: 3000
        },
        {
            teamName: "Above Team",
            teamScore: 2200
        },
        {
            teamName: "Below Team",
            teamScore: 1700
        },
        {
            teamName: "Average Team",
            teamScore: 1500
        }
    ]

    useEffect(() => {
        const newTeamsArray: {teamName: string, teamScore: number}[] = [...templateData]
        newTeamsArray.push(props.yourTeamData)

        newTeamsArray.sort((a, b) => a.teamScore > b.teamScore ? -1 : a.teamScore < b.teamScore ? 1 : 0)

        setSortedTeams([...newTeamsArray])
    }, [props.yourTeamData])

    return(
        <div className="leaderboard-container">
            <div className="rail-background">
                <div></div>
                <div></div>
            </div>

            <div className="leaderboard-items">
                {sortedTeams.map((team, index) => (
                    <div key={index} className={(team.teamName == "Your team" ? " your-team-item" : index == 0 ? "first-team-item" : "") + " leaderboard-item"}>
                        {index == 0 ? <div className="first-team-crown">👑</div> : null}
                        <div className="team-name">{team.teamName}</div>
                        <div className="team-score">{team.teamScore}</div>
                    </div>
                )) }
            </div>

        </div>
    )
}

export default TeamLeaderboard