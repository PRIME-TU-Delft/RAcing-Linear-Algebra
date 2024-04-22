import React, { useState, useEffect, useContext } from "react"
import "./Lecturer.css"
import { useNavigate } from "react-router-dom"
import socket from "../../../socket"
import useWindowDimensions from "../../RaceThemes/Tracks/WindowDimensions"
import StationDisplay from "../../RaceThemes/StationDisplay/StationDisplay"
import CheckPoint from "./LeaderBoard/CheckPoint"
import LeaderBoard from "./LeaderBoard/LeaderBoard"
import QuestionStatistics from "./QuestionStatistics/QuestionStatistics"
import RaceTheme from "../../RaceThemes/RaceTheme"
import LecturerService from "./LecturerService"
import { Ghost } from "../../RaceThemes/SharedUtils"
import { RaceDataContext } from "../../../contexts/RaceDataContext"
import { TimeContext } from "../../../contexts/TimeContext"
import { trainMaps } from "../../RaceThemes/Maps/TrainMaps"
import { ScoreContext } from "../../../contexts/ScoreContext"

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
    ghostTeams: Ghost[]
    roundDuration: number
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

    //check if the round is finished
    const [roundFinished, setRoundFinished] = useState(false)

    //shows the checkpoint leaderboard or not
    const [showCP, setShowCP] = useState(false)

    //shows the final leaderboard or not
    const [showLeaderBoard, setShowLeaderBoard] = useState(false)

    //checkpoint
    const [location, setLocation] = useState("Home")

    //score data for all teams for the final leaderboard
    const [teamScores, setTeamScores] = useState<Teams[]>([])

    //data for all teams for checkpoint leaderboard
    const [checkpointData, setCheckpointData] = useState<checkpointTeams[]>([])

    //check if game ends
    const [gameEnds, setGameEnds] = useState(false)

    //to navigate to another screen
    const navigate = useNavigate()

    const usedTime = useContext(TimeContext);
    const scores = useContext(ScoreContext)

    //show checkpoint leaderboard for 15s
    const showCheckPoint = () => {
        // setShowCP(true)
        // setTimeout(() => {
        //     setShowCP(false)
        // }, 15000)
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
        if (usedTime >= props.roundDuration) 
            timeUp()
    }, [usedTime])

    // Socket changes
    useEffect(() => {
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
        socket.emit("getGhostTeams")

        //if no more rounds, end game
        if (gameEnds) {
            navigate("/endGame")
        } else {
            // setScore(0)
            setLocation("Home")
            // setAccuracy(100)
            setRoundFinished((cur) => false)
        }
    }

    return (
        <div>
            <div className="lecturer-header">
                <div className="t-name">TeamName: {props.teamName}</div>
                <div className="countdown">
                    <div>Time: {LecturerService.formatTime(props.roundDuration - usedTime)}</div>
                </div>

                <div className="total-score">
                    <div>Score: {scores.currentPoints}</div>
                    <div>Accuracy: {scores.currentAccuracy}%</div>
                </div>
            </div>
            {!roundFinished ? (
                <div
                    style={{ width: "100%", height: `${height - 100}px` }}
                    className="map"
                >
                        <RaceTheme
                            mapDimensions ={{
                                width: width,
                                height: height - 100 
                            }}
                            setCheckpoint={(data: string) =>
                                setLocation((current) => data)
                            }
                            showCheckPoint={() => showCheckPoint()}
                        ></RaceTheme>
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
                        score={scores.currentPoints}
                        minutes={10 - Math.ceil((props.roundDuration - usedTime) / 60)}
                        seconds={60 - ((props.roundDuration - usedTime) % 60)}
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
                        yourScore={scores.currentPoints}
                        yourAccuracy={scores.currentAccuracy}
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
        </div>
    )
}
export default Lecturer
