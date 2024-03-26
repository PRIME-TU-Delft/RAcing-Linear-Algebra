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

function App() {
    const [lobbyId, setLobbyId] = useState(0)
    const [isPlayer, setIsPlayer] = useState(false)
    const [teamName, setTeamName] = useState("New Team")
    const [theme, setTheme] = useState("train")
    const [topic, setTopic] = useState("")
    const [gameInProgress, setGameInProgress] = useState(false)
    const [roundDuration, setRoundDuration] = useState<number>(0)
    const [timeUsed, setTimeUsed] = useState<number>(0)
    const [ghostTeams, setGhostTeams] = useState<Ghost[]>([])

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
                setTimeUsed((timeUsed) => timeUsed + 1)
            } else {
                clearInterval(interval)
            }
        }, 1000)
    }

    const gameStartHandler = () => {
        startGameTimer()
        if (isPlayer) 
            navigate("/Game")
        else 
            navigate("/Lecturer")
    }

    useEffect(() => {
        function onGhostTeamsReceived(data: ServerGhost[]) {
            console.log(data)
            const intializedGhosts: Ghost[] = initializeFrontendGhostObjects(data)
            setGhostTeams((curr) => [...intializedGhosts])
        }

        function onRoundStarted(roundDuration: number) {
            setRoundDuration(curr => roundDuration)
            setGameInProgress(curr => true)
            socket.emit("getGhostTeams")
        }

        function onThemeChange(theme: string) {
            setTheme(curr => theme)
        }

        socket.on("round-duration", onRoundStarted)
        socket.on("ghost-teams", onGhostTeamsReceived)
        socket.on("round-started", onRoundStarted)
        socket.on("themeChange", onThemeChange)
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
                        />
                    }
                ></Route>
                <Route
                    path="/Waiting"
                    element={<Waiting theme={theme} setTheme={setTheme} lobbyId={lobbyId} gameIsInProgress={gameInProgress}
                    />}
                ></Route>
                <Route 
                    path="/TeamPreview" 
                    element={<TeamPreview 
                            	theme={theme} 
                                topic={topic} 
                                ghostTeams={ghostTeams}
                                mainTeamName={teamName}
                                onStartGame={() => gameStartHandler()}></TeamPreview>
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
                    <TimeContext.Provider value={roundDuration - timeUsed}>
                        <Game theme={theme} roundDuration={roundDuration}/>
                    </TimeContext.Provider>
                } />
                <Route
                    path="/Lecturer"
                    element={
                        <TimeContext.Provider value={timeUsed}>
                            <Lecturer
                                lobbyId={lobbyId}
                                teamName={teamName}
                                ghostTeams={ghostTeams}
                                theme={theme}
                                roundDuration={roundDuration}
                            />
                        </TimeContext.Provider>
                    }
                ></Route>
                <Route path="/endGame" element={<EndGameScreen />}></Route>
            </Routes>
        </div>
    )
}

export default App
