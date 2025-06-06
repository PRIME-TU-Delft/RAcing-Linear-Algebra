import React, { useEffect, useState } from "react";
import "./Leaderboard.css"
import { Ghost } from "../../../RaceThemes/SharedUtils";
import { getColorForStudy } from "../../../RaceThemes/Ghosts/GhostService";
import { a, useTrail } from "react-spring";
import { useNavigate } from "react-router-dom";
import socket from "../../../../socket";

interface Props {
    teamname: string
    teamScore: number
    playerScore: number
    averageTeamScore: number
    teamStudy: string
    ghosts: Ghost[]
    lapsCompleted: number
    isLecturer: boolean
    isLastRound: boolean
    fullLapScoreValue: number
}

interface LeaderboardItem {
    teamname: string,
    lapsCompleted: number,
    score: number,
    study: string,
    isMainTeam: boolean,
}

// Name Study Laps Score

function Leaderboard(props: Props) {
    const [sortedLeaderboardItems, setSortedLeaderboardItems] = useState<LeaderboardItem[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        const team = {
            teamname: props.teamname,
            lapsCompleted: props.lapsCompleted,
            score: props.teamScore,
            study: props.teamStudy,
            isMainTeam: true
        }

        const ghosts = props.ghosts.map(x => ({
            teamname: x.teamName,
            lapsCompleted: Math.floor(Math.floor(x.timeScores[x.timeScores.length - 1].score) / props.fullLapScoreValue),
            score: Math.floor(x.timeScores[x.timeScores.length - 1].score),
            study: x.study,
            isMainTeam: false
        }))

        const leaderboardItems = [...ghosts, team]
        leaderboardItems.sort(function(a, b) {
            return b.score - a.score;
        });

        setSortedLeaderboardItems(curr => [...leaderboardItems])
    }, [props])

    const leaderboardAnimation = useTrail(sortedLeaderboardItems.length, {
        config: { mass: 5, tension: 2000, friction: 200, duration: 200},
        from: { opacity: 0, y: -10 },
        to: { opacity: 1, y: 0 },
    })

    return(
        <div className="leaderboard-background">
            <div className="leaderboard-title">
                Leaderboard
            </div>
            <div className="header-leaderboard-row header-container">
                <div className="row">
                    <div className="col-1">
                        Rank
                    </div>
                    <div className="col-3">
                        Name
                    </div>
                    {!props.isLecturer && (
                        <div className="col-1 text-center">
                            Individual
                        </div>
                    )}
                    <div className="col-1 text-center">
                        Average
                    </div>
                    <div className="col-2 text-center">
                        Team Score
                    </div>
                    <div className="col-2 text-center">
                        Study
                    </div>
                    <div className="col-1 text-center">
                        Laps
                    </div>
                </div>
            </div>
            <div className="end-leaderboard-container">
                
                {leaderboardAnimation.map((stl, index) => (
                    <a.div style={stl} className={"leaderboard-item rounded" + (sortedLeaderboardItems[index].isMainTeam ? " main-team-item" : "")} key={index}>
                        <div className="row">
                            <div className="col-1">
                                {index  + 1}
                                <span className="first-place-crown">{index == 0 ? "👑" : ""}</span>
                            </div>
                            <div className="col-3">
                                {sortedLeaderboardItems[index].teamname}
                            </div>
                            {!props.isLecturer && (
                                <div className="col-1 text-center">
                                    {sortedLeaderboardItems[index].isMainTeam ? props.playerScore : ""}
                                </div>
                            )}
                            <div className="col-1 text-center">
                                {sortedLeaderboardItems[index].isMainTeam ? props.averageTeamScore : ""}
                            </div>
                            <div className="col-2 text-center">
                                {sortedLeaderboardItems[index].score}
                            </div>
                            <div className="col-2 text-center">
                                {sortedLeaderboardItems[index].study}
                            </div>
                            <div className="col-1 text-center">
                                {sortedLeaderboardItems[index].lapsCompleted}
                            </div>
                        </div>
                    </a.div>
                ))}
            </div>
            {props.isLecturer ? (
                <div className="leaderboard-continue-button" 
                    onClick={() => {
                        socket.emit("getLecturerStatistics")
                        navigate("/Statistics")
                    }}>
                        Continue
                </div>
            ) : null}
            {!props.isLecturer && props.isLastRound ? (
                <div className="leaderboard-continue-button" 
                    onClick={() => {
                        navigate("/endGame")
                    }}>
                        Continue
                </div>
            ) : null}
        </div>
    )
}

export default Leaderboard