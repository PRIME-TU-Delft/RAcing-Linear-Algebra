import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import "./JoinGame.css"
import { useForm } from "react-hook-form"
import { host } from "../../utils/APIRoutes"
import socket from "../../socket"
import { getOrCreateUserId } from "../../utils/userIdGenerator"
import { toast, Zoom } from "react-toastify"
import { Store } from "react-notifications-component"

interface Props {
    onLobbyJoined: (lobbyId: number) => void
    reconnectionAvailableTime: number
}

function JoinGame(props: Props) {
    const navigate = useNavigate()
    const methods = useForm()
    const [lobbyId, setLobbyId] = useState("")
    const [errorMessage, setErrorMessage] = React.useState("")
    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLobbyId(event.target.value)
    }

    useEffect(() => {
        if (props.reconnectionAvailableTime < Date.now()) return
        const timeLeft = Math.max(Math.floor((props.reconnectionAvailableTime - Date.now()) / 1000), 1)
        Store.addNotification({
            title: "Reconnection spam detected!",
            message: "You are trying to reconnect too fast! Please wait " + timeLeft.toString() + " seconds.",
            type: "warning",
            insert: "top",
            container: "top-right",
            dismiss: {
              duration: 5000,
              onScreen: true
            }
        });
    }, [props.reconnectionAvailableTime])

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
                    "ngrok-skip-browser-warning": "skip-browser-warning"
                },
            }
        )
        const isValid = await res.json()
        if (!isValid) {
            setErrorMessage("Your lobby code is not valid!")
            return
        }

        const userId = getOrCreateUserId()
        socket.emit("joinLobby", lobbyId, userId)
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
