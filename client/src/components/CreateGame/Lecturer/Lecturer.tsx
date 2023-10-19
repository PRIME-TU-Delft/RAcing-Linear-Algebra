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
import LecturerService from "./LecturerService"

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
    const [seconds, setSeconds] = useState(13)

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

    //when 10minutes count down is up
    const timeUp = () => {
        //round ends
        socket.emit("endRound")
    }

    //show statistic screen
    const showStatistic = () => {
        setShowLeaderBoard((cur) => false)
        setRoundFinished((cur) => true)
        socket.emit("getLecturerStatistics")
    }

    // Give warning before refreshing page to prevent disconnecting
    useEffect(() => {
        const unloadCallback = (event: BeforeUnloadEvent) => {
          event.preventDefault();
          event.returnValue = "";
          return "";
        };
      
        window.addEventListener("beforeunload", unloadCallback);
        return () => window.removeEventListener("beforeunload", unloadCallback);
      }, []);
    

    // Timer functionality
    useEffect(() => {
        const interval = setInterval(() => {
            if (seconds > 0) {
                setSeconds((seconds) => seconds - 1)
            } else {
                timeUp()
                clearInterval(interval)
            }
            if (countdown > 1) {
                setCountdown((countdown) => countdown - 1)
            } else {
                setShowPopup(false)
            }
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [seconds])

    // Socket changes
    useEffect(() => {
        socket.on("score", (stats: TeamStats) => {
            setScore((current) =>
                current < stats.score ? stats.score : current
            )
            setAccuracy((current) => stats.accuracy)
        })
        socket.on("game-ended", () => {
            setGameEnds(true)
        })

        socket.on("get-checkpoints", (result: [string, number][]) => {
            const formattedCheckpointData = LecturerService.transformCheckpointData(result)
            setCheckpointData(curr => [...formattedCheckpointData])
        })

        socket.on("get-all-scores", (allScores: IScore[]) => {
            const formattedTeamScores = LecturerService.formatTeamScores(allScores, props.theme)
            setTeamScores(curr => [...formattedTeamScores])
            setShowLeaderBoard(curr => true)
        })
    }, [socket])

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
        }
    }

    return (
        <div>
            <div className="lecturer-header">
                <div className="t-name">TeamName: {props.teamName}</div>
                <div className="countdown">
                    <div>Time: {LecturerService.formatTime(seconds)}</div>
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
                        checkpoints={LecturerService.getCheckpointsForTheme(props.theme)}
                        usedTime={600 - seconds}
                        setCheckpoint={(data: string) =>
                            setLocation((current) => data)
                        }
                        showCheckPoint={() => showCheckPoint()}
                    ></RaceTheme>
                    <StationDisplay
                        points={score}
                        stations={LecturerService.getCheckpointsForTheme(props.theme)}
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
                    <p>It is {showLeaderBoard ? "true" : "false"}</p>
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
