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
    teamStudy: string
    ghosts: Ghost[]
    lapsCompleted: number
    isLecturer: boolean
    isLastRound: boolean
}

interface LeaderboardItem {
    teamname: string,
    lapsCompleted: number,
    score: number,
    study: string,
    isMainTeam: boolean,
}

function Leaderboard(props: Props) {
    const [sortedLeaderboardItems, setSortedLeaderboardItems] = useState<LeaderboardItem[]>([]) // list of leaderboard items sorted by final score
    const navigate = useNavigate()  // defining access to the navigation component

    // When data from props updates, sort the leaderboard items accordingly
    useEffect(() => {
        // Defining the playing team object
        const team = {
            teamname: props.teamname,
            lapsCompleted: props.lapsCompleted,
            score: props.teamScore,
            study: props.teamStudy,
            isMainTeam: true
        }

        // Defining the ghost team objects by mapping the data into appropriate form
        const ghosts = props.ghosts.map(x => ({
            teamname: x.teamName,
            lapsCompleted: x.lapsCompleted,
            score: Math.floor(x.timeScores[x.timeScores.length - 1].score),
            study: x.study,
            isMainTeam: false
        }))
        
        // Constructing an array with both the ghost teams and the playing team
        const leaderboardItems = [...ghosts, team]

        // Sorting the defined array in regards to the final score of each team 
        // (descending, as first place is the team with the highest score)
        leaderboardItems.sort(function(a, b) {
            return b.score - a.score;
        });

        // Updating the stored sorted values for teams
        setSortedLeaderboardItems(curr => [...leaderboardItems])
    }, [props])

    // Defining the trail animation used for showing the leaderboard items upon entry
    // ReactSpring requires you to define the length of the list whose items will be displayed in the configuration
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
                    <div className="col-5">
                        Name
                    </div>
                    <div className="col-1"></div>
                    <div className="col-2 text-center">
                        Score
                    </div>
                    <div className="col-1 text-center">
                        Study
                    </div>
                    <div className="col-1 text-center">
                        Laps
                    </div>
                </div>
            </div>
            <div className="end-leaderboard-container">
                
                {/* Mapping each of the leaderboard items to an element, displaying their stats and using the index of the sorted array
                    to display the ranking number (being index + 1, since we don't want to start from 0)*/}
                {leaderboardAnimation.map((props, index) => (
                    <a.div style={props} className={"leaderboard-item rounded" + (sortedLeaderboardItems[index].isMainTeam ? " main-team-item" : "")} key={index}>
                        <div className="row">
                            <div className="col-1">
                                {index  + 1}
                                <span className="first-place-crown">{index == 0 ? "👑" : ""}</span>
                            </div>
                            <div className="col-5">
                                {sortedLeaderboardItems[index].teamname}
                            </div>
                            <div className="col-1"></div>
                            <div className="col-2 text-center">
                                {sortedLeaderboardItems[index].score}
                            </div>
                            <div className="col-1 text-center">
                                {sortedLeaderboardItems[index].study}
                            </div>
                            <div className="col-1 text-center">
                                {sortedLeaderboardItems[index].lapsCompleted}
                            </div>
                        </div>
                    </a.div>
                ))}
            </div>

            {/* If the leaderboard is displayed on the lecturer screen, the continue button should navigate the user to the
                QuestionStatistics screen before ending the round / game */}
            {props.isLecturer ? (
                <div className="leaderboard-continue-button" 
                    onClick={() => {
                        socket.emit("getLecturerStatistics")
                        navigate("/Statistics")
                    }}>
                        Continue
                </div>
            ) : null}

            {/* If the leaderboard is displayed on the player screen and it is the last round of the game, 
                the continue button navigates to the end screen */}
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