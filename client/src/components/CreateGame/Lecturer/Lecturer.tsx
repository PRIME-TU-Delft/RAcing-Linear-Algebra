import React, { useState, useEffect, useContext } from "react"
import "./Lecturer.css"
import { useNavigate } from "react-router-dom"
import socket from "../../../socket"
import useWindowDimensions from "../../RaceThemes/Tracks/WindowDimensions"
import StationDisplay from "../../RaceThemes/StationDisplay/StationDisplay"
import CheckPoint from "./CheckPoint"
import QuestionStatistics from "./QuestionStatistics/QuestionStatistics"
import RaceTheme from "../../RaceThemes/RaceTheme"
import LecturerService from "./LecturerService"
import { Ghost } from "../../RaceThemes/SharedUtils"
import { RaceDataContext } from "../../../contexts/RaceDataContext"
import { TimeContext } from "../../../contexts/TimeContext"
import { trainMaps } from "../../RaceThemes/Maps/TrainMaps"
import { ScoreContext } from "../../../contexts/ScoreContext"
import ColorationInfo from "../../ColorationInfo/ColorationInfo"

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
        // console.log("HERE")
        // socket.emit("endRound")
        // navigate("/Leaderboard")
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
        if (usedTime >= props.roundDuration && props.roundDuration > 0) 
            timeUp()
    }, [usedTime])

    // Socket changes
    useEffect(() => {

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

    return (
        <div>
            <div className="lecturer-header row">
                <div className="col text-start">
                    <div className="t-name">Lobby Code: {props.lobbyId}</div>
                    <div className="t-name">Team Name: {props.teamName}</div>
                </div>
                <div className="col">
                    <div className="countdown">
                        <div>Time: {LecturerService.formatTime(usedTime)}</div>
                    </div>
                </div>
                
                <div className="col">
                    <div className="total-score text-end">
                        <div>Score: {scores.currentPoints}</div>
                        <div>Accuracy: {scores.currentAccuracy}%</div>
                    </div>
                </div>
                
            </div>
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
                        roundDuration={props.roundDuration}
                    ></RaceTheme>
            </div>
            <div className="lecturer-screen-coloration-information">
                <ColorationInfo></ColorationInfo>
            </div>

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
        </div>
    )
}
export default Lecturer
