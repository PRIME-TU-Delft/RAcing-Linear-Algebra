import React, { useState } from "react"
import "./App.css"
import Home from "./components/Home/Home"
import CreateGame from "./components/CreateGame/CreateGame"
import JoinGame from "./components/JoinGame/JoinGame"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Question from "./components/Questions/Question"
import Waiting from "./components/Waiting/Waiting"
import Login from "./components/CreateGame/Login/Login"
import Lobby from "./components/CreateGame/Lobby/Lobby"
import Lecturer from "./components/CreateGame/Lecturer/Lecturer"
import EndGameScreen from "./components/EndGameScreen/EndGameScreen"
import Game from "./components/Game/Game"

function App() {
    const [lobbyId, setLobbyId] = useState(0)
    const [teamName, setTeamName] = useState("New Team")
    const [theme, setTheme] = useState("train")

    const lobbyIdHandler = (id: number) => {
        setLobbyId(curr => id)
    }
    const teamNameHandler = (name: string) => {
        setTeamName(name)
    }

    const themeHandler = (theme: string) => {
        setTheme((current) => theme)
    }

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
