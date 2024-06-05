import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

import "./JoinGame.css"
import { useForm } from "react-hook-form"
import { host } from "../../utils/APIRoutes"
import socket from "../../socket"

interface Props {
    onLobbyJoined: (lobbyId: number) => void
}

function JoinGame(props: Props) {
    const navigate = useNavigate()
    const methods = useForm()
    const [lobbyId, setLobbyId] = useState("")
    const [errorMessage, setErrorMessage] = React.useState("")
    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLobbyId(event.target.value)
    }

    //validate the lobby code entered
    const onSubmit = methods.handleSubmit(async (data) => {
        //accepting format
        const numberRegex = /^[0-9]+$/

        if (!numberRegex.test(lobbyId) || lobbyId.length != 4) {
            setErrorMessage("The code should be a 4 digit number!")

            return
        }

        //validate
        const res = await fetch(
            `${host}/api/lobby/validate/${lobbyId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
        const isValid = await res.json()
        if (!isValid) {
            setErrorMessage("Your lobby code is not valid!")
            return
        }

        socket.emit("joinLobby", lobbyId)
        props.onLobbyJoined(parseInt(lobbyId))
        //go to the waiting screen
        navigate("/Waiting")
    })

    return (
        <div className="join-game">
            <div className="join-game-title">
                <p>Join the game using the code from your lecturer!</p>
            </div>
            <button className="back-btn" onClick={() => navigate("/")}>
                <p className="back-arrow">{"\u2190"}</p>
            </button>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    onSubmit()
                }}
            >
                <input
                    type="text"
                    className="join-game-input"
                    placeholder="E.g. 1217"
                    onChange={(e) => changeHandler(e)}
                />
                <button className="join-game-btn" type="submit">
                    <p>Join</p>
                </button>
                {errorMessage && <div className="error"> {errorMessage} </div>}
            </form>
        </div>
    )
}

export default JoinGame
