import React, { useState, useEffect } from "react"
import "./CheckPoint.css"

interface checkpointTeams {
    //Team object to store the data to be displayed on the leaderboard
    teamName: string
    teamMinutes: number
    teamSeconds: number
}

interface Props {
    location: string //checkpoint

    teamName: string //teamname of my team

    score: number // score of my team
    //my arrival time
    minutes: number
    seconds: number
    //teams data to be displayed
    teams: checkpointTeams[]
}

function CheckPoint(props: Props) {
    //team data for my team
    const myTeam: checkpointTeams = {
        teamName: props.teamName,
        teamMinutes: props.minutes,
        teamSeconds: props.seconds,
    }
    //data for all teams
    const [teams, setTeams] = useState<checkpointTeams[]>([
        ...props.teams,
        myTeam,
    ])
    //make them constants so they do not change with timer, but only when initiated
    const [minutes] = useState(props.minutes)
    const [seconds] = useState(props.seconds)
    //size of window
    const [dimensions, setDimensions] = React.useState({
        height: window.innerHeight,
        width: window.innerWidth,
    })

    useEffect(() => {
        //sort the teams in acsending order of arrival time
        const sortedData = [...teams]
            .filter((item) => item.teamMinutes > 0 || item.teamSeconds > 0)
            .sort((a, b) => {
                if (a.teamMinutes === b.teamMinutes) {
                    return a.teamSeconds - b.teamSeconds
                } else {
                    return a.teamMinutes - b.teamMinutes
                }
            })
        //window size
        function handleResize() {
            setDimensions({
                height: window.innerHeight,
                width: window.innerWidth,
            })
        }

        setTeams((current) => sortedData)
        //handle window size changes
        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    //display the arrival time int correct format
    const showTime = (m: number, s: number) => {
        let sString = s.toString()
        let mString = m.toString()
        if (sString.length == 1) {
            sString = "0" + sString
        }
        if (mString.length == 1) {
            mString = "0" + mString
        }
        const res = mString + ":" + sString

        return res
    }

    //top 5 teams to be displayed
    const column1Teams = teams.slice(0, 5)

    // find the position of a specific team
    const findPosition = (
        teamName: string,
        minutes: number,
        seconds: number
    ) => {
        const index = teams.findIndex(
            (team) =>
                team.teamName === teamName &&
                team.teamMinutes === minutes &&
                team.teamSeconds === seconds
        )
        return index + 1
    }

    // make sure fonts and other components resize with window
    const getClassName = () => {
        if (dimensions.width < 1000 || dimensions.height < 300) {
            return "-small"
        } else if (dimensions.width < 1500 || dimensions.height < 500) {
            return "-medium"
        } else return ""
    }

    return (
        <div>
            <div className={"top-border" + getClassName()}>
                <div className="location">
                    You have reached:<br></br> {props.location}
                </div>

                <div className="your-score">
                    Your Time Taken: {showTime(minutes, seconds)}
                </div>
                <div className="postion">
                    Current Position:{" "}
                    {findPosition(props.teamName, minutes, seconds)}
                </div>
            </div>
            <div className="table-container">
                <div className="table-wrapper">
                    <div className="table-column">
                        <table className={"table" + getClassName()}>
                            <thead>
                                <tr className="table-header">
                                    <th>Rank</th>
                                    <th>Team Name </th>
                                    <th>Time Taken</th>
                                </tr>
                            </thead>
                            <tbody>
                                {column1Teams.map((item, rank) => (
                                    <tr
                                        className={
                                            item.teamName == props.teamName &&
                                            item.teamMinutes == minutes &&
                                            item.teamSeconds == seconds
                                                ? "highlighted-row"
                                                : "table-row"
                                        }
                                        key={rank}
                                    >
                                        <td className="table-cell">
                                            {rank + 1}
                                        </td>
                                        <td className="table-cell name">
                                            {item.teamName}
                                        </td>
                                        <td className="table-cell team-score">
                                            {showTime(
                                                item.teamMinutes,
                                                item.teamSeconds
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckPoint
