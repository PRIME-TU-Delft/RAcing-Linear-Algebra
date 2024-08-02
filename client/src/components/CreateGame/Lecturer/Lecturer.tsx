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
    teamname: string        // name of the team
    score: number           // score of the team
    checkpoints: number[]   // list of checkpoints of the team
    roundId: string         // id of the round
    study: string           // study of the team
    accuracy: number        // accuracy of the team
}

interface Props {
    lobbyId: number         // id of the current lobby
    teamName: string        // name of the playing team
    theme: string           // selected visual theme (train, boat...)
    ghostTeams: Ghost[]     // list of ghost teams
    roundDuration: number   // selected duration of the round
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

    const usedTime = useContext(TimeContext)    // get time used so far from the TimeContext
    const scores = useContext(ScoreContext)     // get the scores from the ScoreContext

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

    return (
        <div>
            <div className="lecturer-header">
                <div className="t-name">Team Name: {props.teamName}</div>
                <div className="countdown">
                    <div>Time: {LecturerService.formatTime(usedTime)}</div>
                </div>

                <div className="total-score">
                    <div>Score: {scores.currentPoints}</div>
                    <div>Accuracy: {scores.currentAccuracy}%</div>
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
                        roundDuration={props.roundDuration}
                    ></RaceTheme>
            </div>
            <div className="lecturer-screen-coloration-information">
                <ColorationInfo></ColorationInfo>
            </div>
        </div>
    )
}
export default Lecturer
