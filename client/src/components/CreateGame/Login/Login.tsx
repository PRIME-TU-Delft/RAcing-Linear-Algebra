import React, { useEffect, useState, ChangeEvent } from "react"
import "./Login.css"
import { useNavigate } from "react-router-dom"
import { host } from "../../../utils/APIRoutes"
import socket from "../../../socket"

interface Props {
    onLobbyIdCreated: (id: number) => void
}

function Login(props: Props) {
    const [passwordMessage, setPasswordMessage] = useState("")
    const [inputText, setInputText] = useState("")

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value)
    }

    useEffect(() => {
        socket
            .off("authenticated")
            .on("authenticated", (correctPassword: number) => {
                if (correctPassword) loginHandler()
                else {
                    setPasswordMessage("Wrong password")
                    setTimeout(() => {
                        setPasswordMessage("")
                    }, 5000)
                }
            })
    })

    const navigate = useNavigate()
    const loginHandler = async () => {
        // Login stuf...
        const res = await fetch(`${host}/api/lobby/create`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "skip-browser-warning"
            },
        })
        const resJson = await res.json()
        const lobbyId = resJson[0]
        socket.emit("createLobby", lobbyId)
        props.onLobbyIdCreated(lobbyId as number)

        navigate("/Lobby")
    }

    return (
        <div className="login">
            <div className="login-title">
                <p>You must first login to create a game.</p>
            </div>

            <form
                className="login-form"
                onKeyDown={(e) => {
                    if (e.key == "Enter") socket.emit("authenticate", inputText)
                }}
            >
                <br />
                <input
                    type="password"
                    placeholder="Password"
                    className="login-input"
                    onChange={handleChange}
                    value={inputText}
                />
                <button
                    data-testid="login-button"
                    className="login-btn"
                    onClick={(e) => {
                        e.preventDefault()
                        socket.emit("authenticate", inputText)
                    }}
                >
                    <p>Login</p>
                </button>
            </form>
            <button className="back-btn" onClick={() => navigate("/")}>
                <p className="back-arrow">{"\u2190"}</p>
            </button>

            <p className="pwd-message" data-testid="message">
                {passwordMessage}
            </p>
        </div>
    )
}

export default Login
