import React, { useEffect, useState } from "react"
import "./App.css"
import Home from "./components/Home/Home"
import CreateGame from "./components/CreateGame/CreateGame"
import JoinGame from "./components/JoinGame/JoinGame"
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import TestValues from "./utils/testValues"
import Waiting from "./components/Waiting/Waiting"
import Login from "./components/CreateGame/Login/Login"
import Lobby from "./components/CreateGame/Lobby/Lobby"
import Lecturer from "./components/CreateGame/Lecturer/Lecturer"
import EndGameScreen from "./components/EndGameScreen/EndGameScreen"
import Game from "./components/Game/Game"
import TeamPreview from "./components/RaceThemes/TeamPreview/TeamPreview"
import { Ghost, ServerGhost } from "./components/RaceThemes/SharedUtils"
import { initializeFrontendGhostObjects } from "./components/RaceThemes/Ghosts/GhostService"
import socket from "./socket"
import testValues from "./utils/testValues"
import { TimeContext } from "./contexts/TimeContext"
import { RaceDataContext } from "./contexts/RaceDataContext"
import LecturerService from "./components/CreateGame/Lecturer/LecturerService"
import { trainMaps } from "./components/RaceThemes/Maps/TrainMaps"
import { ScoreContext } from "./contexts/ScoreContext"
import Leaderboard from "./components/CreateGame/Lecturer/LeaderBoard/Leaderboard"
import QuestionStatistics from "./components/CreateGame/Lecturer/QuestionStatistics/QuestionStatistics"

function App() {
    const [lobbyId, setLobbyId] = useState(0)
    const [isPlayer, setIsPlayer] = useState(true)
    const [teamName, setTeamName] = useState("New Team")
    const [theme, setTheme] = useState("train")
    const [topic, setTopic] = useState("")
    const [study, setStudy] = useState("")
    const roundDuration = 60
    const [timeUsed, setTimeUsed] = useState<number>(0)
    const [ghostTeams, setGhostTeams] = useState<Ghost[]>([])

    const [fullLapScoreValue, setFullLapScoreValue] = useState<number>(1)
    const [currentScore, setCurrentScore] = useState<number>(0)
    const [currentAccuracy, setCurrentAccuracy] = useState<number>(0)
    const [averageTeamScore, setAverageTeamScore] = useState<number>(0)
    const [allRoundsFinished, setAllRoundsFinished] = useState<boolean>(false)
    const [roundstarted, setRoundStarted] = useState<boolean>(false)

    const navigate = useNavigate()

    const lobbyIdHandler = (id: number) => {
        setLobbyId(curr => id)
    }

    const isPlayerHandler = (isPlayer: boolean) => {
        setIsPlayer(curr => isPlayer)
    }

    const teamNameHandler = (name: string) => {
        setTeamName(name)
    }

    const themeHandler = (theme: string) => {
        setTheme((current) => theme)
    }

    const topicHandler = (topic: string) => {
        setTopic((current) => topic)
    }

    const startGameTimer = () => {
        const interval = setInterval(() => {
            if (timeUsed < roundDuration) {
                console.log(timeUsed)
                console.log(roundDuration)
                setTimeUsed((timeUsed) => timeUsed + 1)
            } else {
                if (!isPlayer) socket.emit("endRound")
                console.log(timeUsed)
                console.log(roundDuration)
                navigate("/Leaderboard")
                clearInterval(interval)
            }
        }, 1000)
    }

    const resetValues = () => {
        setCurrentScore(curr => 0)
        setCurrentAccuracy(curr => 0)
        setTimeUsed(curr => 0)
    }

    const gameStartHandler = () => {
        if (isPlayer) {
            startGameTimer()
            navigate("/Game")
        }
        else {
            startGameTimer()
            navigate("/Lecturer")
        }
    }

    const nextRoundHandler = () => {
        setRoundStarted(curr => false)
        if (allRoundsFinished) navigate("/endGame")
        else socket.emit("startNextRound")
    }

    useEffect(() => {
        function onGhostTeamsReceived(data: ServerGhost[]) {
            const intializedGhosts: Ghost[] = initializeFrontendGhostObjects(data)
            setGhostTeams((curr) => [...intializedGhosts])
        }

        function onRoundStarted(roundDuration: number) {
            resetValues()
            navigate("/TeamPreview")
            // setRoundDuration(curr => 60) // CHANGE
            setRoundStarted(curr => true)
        }

        function onRoundDuration(roundDuration: number) {
            // setRoundDuration(curr => 60) // CHANGE
            resetValues()
            socket.emit("getGhostTeams")
            socket.emit("getRaceTrackEndScore")
            navigate("/TeamPreview")
        }

        function onThemeChange(theme: string) {
            setTheme(curr => theme)
        }

        function onFullLapScoreValue(score: number) {
            setFullLapScoreValue(curr => score)
        }

        function onScoreUpdate(stats: {score: number, accuracy: number, averageTeamScore: number}) {
            setCurrentScore((current) =>
                current < stats.score ? stats.score : current
            )
            setAverageTeamScore(curr => curr < stats.averageTeamScore ? stats.averageTeamScore : curr)
            setCurrentAccuracy(curr => stats.accuracy)
        }

        function onRaceStarted() {
            gameStartHandler()
        }

        function onGameEnded() {
            setAllRoundsFinished(curr => true)
        }

        socket.on("round-duration", onRoundDuration)
        socket.on("ghost-teams", onGhostTeamsReceived)
        socket.on("round-started", onRoundStarted)
        socket.on("race-started", onRaceStarted)
        // socket.on("round-ended", onRoundEnded)
        socket.on("themeChange", onThemeChange)
        socket.on("race-track-end-score", onFullLapScoreValue)
        socket.on("score", onScoreUpdate)
        socket.on("game-ended", onGameEnded)
    }, [])

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route
                    path="/CreateGame"
                    element={
                        <CreateGame
                            onLobbyIdCreated={(id: number) => {
                                    lobbyIdHandler(id)
                                    isPlayerHandler(false)
                            }
                            }
                        />
                    }
                ></Route>
                <Route 
                    path="/JoinGame" 
                    element={<JoinGame
                        onLobbyJoined={(id: number) => {
                                lobbyIdHandler(id)
                                isPlayerHandler(true)
                            }
                        } />}>
                </Route>
                <Route
                    path="/Lobby"
                    element={
                        <Lobby
                            lobbyId={lobbyId}
                            onTeamNameCreated={(name: string) =>
                                teamNameHandler(name)
                            }
                            onThemeSelected={(theme: string) =>
                                themeHandler(theme)
                            }
                            onStudySelected={(study: string) => 
                                setStudy(curr => study)
                            }
                        />
                    }
                ></Route>
                <Route
                    path="/Waiting"
                    element={<Waiting theme={theme} setTheme={setTheme} lobbyId={lobbyId} 
                    />}
                ></Route>
                <Route 
                    path="/TeamPreview" 
                    element={<TeamPreview 
                            	theme={theme} 
                                topic={topic} 
                                ghostTeams={ghostTeams}
                                mainTeamName={teamName}
                                onStartGame={() => {
                                    socket.emit("beginRace")
                                    gameStartHandler()}
                                }></TeamPreview>
                        }>
                </Route>
                <Route
                    path="/Login"
                    element={
                        <Login
                            onLobbyIdCreated={(id: number) =>
                                lobbyIdHandler(id)
                            }
                        />
                    }
                ></Route>
                <Route path="/Game" element={
                    <TimeContext.Provider value={timeUsed}>
                        <RaceDataContext.Provider value={{
                            theme: theme,
                            ghostTeams: ghostTeams,
                            checkpoints: [],
                            selectedMap: trainMaps[0]
                        }}>
                            <ScoreContext.Provider value={{currentPoints: currentScore, totalPoints: fullLapScoreValue, teamAveragePoints: averageTeamScore, currentAccuracy: currentAccuracy}}>
                                <Game theme={theme} roundDuration={roundDuration} roundStarted={roundstarted} onRoundEnded={() => navigate("/Leaderboard")}/>
                            </ScoreContext.Provider>
                        </RaceDataContext.Provider>
                    </TimeContext.Provider>
                } />
                <Route
                    path="/Lecturer"
                    element={
                        <TimeContext.Provider value={timeUsed}>
                            <RaceDataContext.Provider value={{
                            theme: theme,
                            ghostTeams: ghostTeams,
                            checkpoints: [],
                            selectedMap: trainMaps[0]
                            }}>
                                <ScoreContext.Provider value={{currentPoints: currentScore, totalPoints: fullLapScoreValue, teamAveragePoints: averageTeamScore, currentAccuracy: currentAccuracy}}>
                                    <Lecturer
                                        lobbyId={lobbyId}
                                        teamName={teamName}
                                        ghostTeams={ghostTeams}
                                        theme={theme}
                                        roundDuration={roundDuration}
                                    />
                                </ScoreContext.Provider>
                            </RaceDataContext.Provider>
                        </TimeContext.Provider>
                    }
                ></Route>
                <Route
                    path="/Leaderboard"
                    element={
                        <Leaderboard
                            ghosts={ghostTeams}
                            teamname={teamName}
                            teamScore={currentScore}
                            teamStudy={study}
                            lapsCompleted={Math.floor(currentScore / fullLapScoreValue)}
                            isLecturer={!isPlayer}
                        />
                    }
                ></Route>
                <Route path="/endGame" element={<EndGameScreen />}></Route>
                <Route path="/Statistics" element={<QuestionStatistics onContinue={() => nextRoundHandler()}/>}></Route>
            </Routes>
        </div>
    )
}

export default App
