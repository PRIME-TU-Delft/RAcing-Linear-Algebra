import React, { useState, useEffect } from "react"
import "./Lecturer.css"
import { useNavigate } from "react-router-dom"
import socket from "../../../socket"
import useWindowDimensions from "../../RaceThemes/TrainTheme/Tracks/WindowDimensions"
import StationDisplay from "../../RaceThemes/TrainTheme/StationDisplay/StationDisplay"
import CheckPoint from "./LeaderBoard/CheckPoint"
import LeaderBoard from "./LeaderBoard/LeaderBoard"
import QuestionStatistics from "./QuestionStatistics/QuestionStatistics"
import RaceTheme from "../../RaceThemes/RaceTheme"

//score object received from backend
export interface IScore {
    teamname: string
    score: number
    checkpoints: number[]
    roundId: string
    study: string
    accuracy: number
}

interface Props {
    lobbyId: number
    teamName: string
    theme: string
}

//data to be displayed
interface TeamStats {
    score: number
    accuracy: number
}

//Team object to store information about your team on the final leaderboard
interface Teams {
    name: string
    score: number
    accuracy: number
    checkpoint: string
}

//Team object to store information about your team on the checkpoint leaderboard
interface checkpointTeams {
    teamName: string
    teamMinutes: number
    teamSeconds: number
}

function Lecturer(props: Props) {
    //window size
    const { width, height } = useWindowDimensions()

    //total seconds of count down(10 minutes), added additional of 3 because of the 3s count down
    const [seconds, setSeconds] = useState(603)

    //score of the team
    const [score, setScore] = useState(0)

    //accuracy of the team
    const [accuracy, setAccuracy] = useState(100)

    //check if the round is finished
    const [roundFinished, setRoundFinished] = useState(false)

    //shows the checkpoint leaderboard or not
    const [showCP, setShowCP] = useState(false)

    //shows the final leaderboard or not
    const [showLeaderBoard, setShowLeaderBoard] = useState(false)

    //checkpoint
    const [location, setLocation] = useState("Home")

    //check if 10 minutes if up
    const [timeIsUp, setTimeUp] = useState(false)

    //shows the 3s pop up countdown
    const [showPopup, setShowPopup] = useState(true)

    //how many seconds of count down when the screen starts
    const [countdown, setCountdown] = useState(3)

    //score data for all teams for the final leaderboard
    const [teamScores, setTeamScores] = useState<Teams[]>([])

    //data for all teams for checkpoint leaderboard
    const [checkpointData, setCheckpointData] = useState<checkpointTeams[]>([])

    //check if game ends
    const [gameEnds, setGameEnds] = useState(false)

    //to navigate to another screen
    const navigate = useNavigate()

    //show checkpoint leaderboard for 15s
    const showCheckPoint = () => {
        setShowCP(true)
        setTimeout(() => {
            setShowCP(false)
        }, 15000)
    }

    //handle the checkpoint data received from server, store them into checkpoint teams
    const transformCheckpointData = (
        result: [string, number][]
    ): checkpointTeams[] => {
        return result.map(([teamName, seconds]) => {
            const teamMinutes = Math.floor(Math.max(0, seconds / 60))
            const teamSeconds = seconds % 60
            return {
                teamName,
                teamMinutes,
                teamSeconds,
            }
        })
    }

    //set checkpoint data with the data received from server
    const handleGetCheckpoints = async () => {
        const result: [string, number][] = await new Promise((resolve) => {
            socket.on("get-checkpoints", (result) => {
                resolve(result)
            })
        })
        setCheckpointData(transformCheckpointData(result))
    }

    //when 10minutes count down is up
    const timeUp = async () => {
        //round ends
        socket.emit("endRound")

        //receive data for all teams
        const result: IScore[] = await new Promise((resolve) => {
            socket.on("get-all-scores", (res: IScore[]) => {
                resolve(res)
            })
        })

        //sort the scores in descending order of score
        result.sort((a, b) => b.score - a.score)

        //handle the data received from server
        const teamScores: Teams[] = result.map(
            (item): Teams => ({
                name: item.teamname,
                score: item.score,
                accuracy: item.accuracy,
                checkpoint: findCheckPoint(item.checkpoints.length),
            })
        )

        setTeamScores(teamScores)
        //show final leaderboard
        setShowLeaderBoard(true)
    }

    //find the name of a certain checkpoint
    const findCheckPoint = (index: number) => {
        if (index == 1) {
            return stations[0].name
        } else if (index == 2) {
            return stations[1].name
        } else if (index == 3) {
            return stations[2].name
        }
        return "Home"
    }

    //shows an alert when try to reload or leave
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault()
        event.returnValue = "Are you sure you want to leave this page?"
    }

    //show statistic screen
    const showStatistic = () => {
        setShowLeaderBoard((cur) => false)
        setRoundFinished((cur) => true)
        socket.emit("getLecturerStatistics")
    }

    useEffect(() => {
        //timer
        const interval = setInterval(() => {
            if (seconds > 0) {
                setSeconds((seconds) => seconds - 1)
            } else if (seconds == 0 && !timeIsUp) {
                setTimeUp((cur) => true)
            }
            if (countdown > 1) {
                setCountdown((countdown) => countdown - 1)
            } else {
                setShowPopup(false)
            }
        }, 1000)
        if (timeIsUp && seconds == 0) timeUp()
        //for alert when refresh/close
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => {
            clearInterval(interval)
            // so the alert only shows once

            //window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [seconds, timeIsUp])

    //for sockets
    useEffect(() => {
        handleGetCheckpoints()
        socket.on("score", (stats: TeamStats) => {
            setScore((current) =>
                current < stats.score ? stats.score : current
            )
            setAccuracy((current) => stats.accuracy)
        })
        socket.on("game-ended", () => {
            setGameEnds(true)
        })
    }, [socket])

    //display time correctly
    const showTime = () => {
        const minute = Math.floor(seconds / 60)
        let s = (seconds % 60).toString()
        let m = minute.toString()
        if (minute >= 10) {
            s = "0"
        }
        if (s.length == 1) {
            s = "0" + s
        }
        if (m.length == 1) {
            m = "0" + m
        }

        return `${m}:${s}`
    }

    //reset everything when new round start
    const startNewRound = () => {
        socket.emit("startNextRound")

        //if no more rounds, end game
        if (gameEnds) {
            navigate("/endGame")
        } else {
            setSeconds((cur) => 603)
            setScore(0)
            setLocation("Home")
            setAccuracy(100)
            setRoundFinished((cur) => false)
            setShowPopup((cur) => true)
            setCountdown((cur) => 3)
            setTimeUp((cur) => false)
        }
    }

    //checkpoints for train
    const stations = [
        {
            name: "Delft",
            points: 150,
        },
        {
            name: "Rotterdam Centraal",
            points: 300,
        },
        {
            name: "Eindhoven Centraal",
            points: 450,
        },
    ]

    //checkpoints for boat
    const islands = [
        {
            name: "Solitude Island",
            points: 150,
        },
        {
            name: "Mystic Isle",
            points: 300,
        },
        {
            name: "Hidden Oasis",
            points: 450,
        },
    ]

    return (
        <div>
            <div className="lecturer-header">
                <div className="t-name">TeamName: {props.teamName}</div>
                <div className="countdown">
                    <div>Time: {showTime()}</div>
                </div>

                <div className="total-score">
                    <div>Score: {score}</div>
                    <div>Accuracy: {accuracy}%</div>
                </div>
            </div>
            {!roundFinished ? (
                <div
                    style={{ width: "100%", height: `${height - 100}px` }}
                    className="map"
                >
                    <RaceTheme
                        selectedTheme={props.theme}
                        maxPoints={1000}
                        averageGoalPoints={500}
                        currentPoints={score}
                        mapDimensions={{ width: width, height: height - 100 }}
                        checkpoints={
                            props.theme.toLocaleLowerCase() == "train"
                                ? stations
                                : islands
                        }
                        usedTime={600 - seconds}
                        setCheckpoint={(data: string) =>
                            setLocation((current) => data)
                        }
                        showCheckPoint={() => showCheckPoint()}
                    ></RaceTheme>
                    <StationDisplay
                        points={score}
                        stations={
                            props.theme.toLocaleLowerCase() == "train"
                                ? stations
                                : islands
                        }
                    ></StationDisplay>
                </div>
            ) : (
                <div className="statistics-wrapper">
                    <h1>Questions</h1>

                    <button
                        className="next-btn"
                        onClick={() => {
                            startNewRound()
                        }}
                    >
                        <p className="forward-arrow">{"\u2192"}</p>
                    </button>
                    <QuestionStatistics></QuestionStatistics>
                </div>
            )}

            {showCP && (
                <div className="checkpoint-title">
                    <CheckPoint
                        data-testid="checkpoint"
                        location={location}
                        teamName={props.teamName}
                        score={score}
                        minutes={10 - Math.ceil(seconds / 60)}
                        seconds={60 - (seconds % 60)}
                        teams={checkpointData}
                    ></CheckPoint>
                    <button
                        className="close-btn"
                        onClick={() => setShowCP(false)}
                    >
                        <p className="x">X</p>
                    </button>
                </div>
            )}
            {showLeaderBoard && (
                <div className="leaderboard-wrapper">
                    <LeaderBoard
                        data-testid="leaderboard"
                        teamname={props.teamName}
                        yourScore={score}
                        yourAccuracy={accuracy}
                        yourCheckPoint={location}
                        teams={teamScores}
                    ></LeaderBoard>
                    <button
                        className="next-btn"
                        onClick={() => {
                            showStatistic()
                        }}
                    >
                        <p className="forward-arrow">{"\u2192"}</p>
                    </button>
                </div>
            )}
            <div className={`popup ${showPopup ? "show" : ""}`}>
                <div className="popup-content">
                    <p>
                        <span
                            className="countdown-text"
                            data-testid="count-down"
                        >
                            {countdown}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}
export default Lecturer
