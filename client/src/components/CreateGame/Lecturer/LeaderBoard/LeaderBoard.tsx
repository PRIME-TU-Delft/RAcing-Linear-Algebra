import React, { useState, useEffect } from "react"
import "./LeaderBoard.css"

interface Props {
    teamname: string // your team name
    yourScore: number
    yourAccuracy: number
    yourCheckPoint: string

    //teams data to be displayed
    teams: Teams[]
}

interface Teams {
    //Team object to store the data of teams to be displayed on database
    name: string
    score: number
    accuracy: number
    checkpoint: string
}

function LeaderBoard(props: Props) {
    const [teams, setTeams] = useState<Teams[]>([...props.teams])

    //sort the teams in descending order of score
    teams.sort((a, b) => b.score - a.score)

    //window size
    const [dimensions, setDimensions] = React.useState({
        height: window.innerHeight,
        width: window.innerWidth,
    })

    // find the position of a specific team
    const findPosition = (
        teamName: string,
        score: number,
        accuracy: number
    ) => {
        const index = teams.findIndex(
            (team) =>
                team.name == teamName &&
                team.score == score &&
                team.accuracy == accuracy
        )
        if (index + 1 == 0) return 1
        return index + 1
    }

    //handle window resize
    useEffect(() => {
        function handleResize() {
            setDimensions({
                height: window.innerHeight,
                width: window.innerWidth,
            })
        }
        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    // make sure fonts and other components resize with window
    const getClassName = () => {
        if (dimensions.width < 1000 || dimensions.height < 300) {
            return "-small"
        } else if (dimensions.width < 1500 || dimensions.height < 500) {
            return "-medium"
        } else return ""
    }

    //only display top10 teams
    const top10Teams = teams.slice(0, 10)

    return (
        <div>
            <div className="leaderboard-title">Leaderboard</div>
            <div className="your-position">
                Your Position:{" "}
                {findPosition(
                    props.teamname,
                    props.yourScore,
                    props.yourAccuracy
                )}
            </div>
            <table className={"leaderboard-table" + getClassName()}>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Accuracy</th>
                        <th>Checkpoint</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {top10Teams.map((item, rank) => (
                        <tr
                            key={rank}
                            className={
                                item.name == props.teamname &&
                                item.score == props.yourScore &&
                                item.accuracy == props.yourAccuracy
                                    ? "highlighted-row"
                                    : "normal-row"
                            }
                        >
                            <td className="leaderboard-rank">{rank + 1}</td>
                            <td className="leaderboard-name">{item.name}</td>
                            <td className="leaderboard-accuracy">
                                {item.accuracy}%
                            </td>
                            <td className="leaderboard-checkpoints">
                                {item.checkpoint}
                            </td>
                            <td className="leaderboard-score">{item.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default LeaderBoard
