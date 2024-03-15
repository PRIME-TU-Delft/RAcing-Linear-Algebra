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

function App() {
    const [lobbyId, setLobbyId] = useState(0)
    const [teamName, setTeamName] = useState("New Team")
    const [theme, setTheme] = useState("train")
    const [topic, setTopic] = useState("")
    const [roundDuration, setRoundDuration] = useState<number>(0)
    const [ghostTeams, setGhostTeams] = useState<Ghost[]>([])

    const navigate = useNavigate()


    const lobbyIdHandler = (id: number) => {
        setLobbyId(curr => id)
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

    useEffect(() => {
        function onGhostTeamsReceived(data: ServerGhost[]) {
            console.log(data)
            const intializedGhosts: Ghost[] = initializeFrontendGhostObjects(data)
            setGhostTeams((curr) => [...intializedGhosts])
        }

        function onRoundDuration(roundDuration: number) {
            setRoundDuration(curr => roundDuration)
            socket.emit("getGhostTeams")
        }

        socket.on("round-duration", onRoundDuration)
        socket.on("ghost-teams", onGhostTeamsReceived)
    }, [])

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route
                    path="/CreateGame"
                    element={
                        <CreateGame
                            onLobbyIdCreated={(id: number) =>
                                lobbyIdHandler(id)
                            }
                        />
                    }
                ></Route>
                <Route 
                    path="/JoinGame" 
                    element={<JoinGame
                        onLobbyJoined={(id: number) =>
                            lobbyIdHandler(id)
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
                                onStartGame={() => navigate("/Lecturer")}></TeamPreview>
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
                <Route path="/game" element={<Game theme={theme} />} />
                <Route
                    path="/Lecturer"
                    element={
                        <Lecturer
                            lobbyId={lobbyId}
                            teamName={teamName}
                            ghostTeams={ghostTeams}
                            theme={theme}
                        />
                    }
                ></Route>
                <Route path="/endGame" element={<EndGameScreen />}></Route>
            </Routes>
        </div>
    )
}

export default App
