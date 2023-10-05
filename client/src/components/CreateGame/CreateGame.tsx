import React, { useState } from "react"
import "./CreateGame.css"
import Login from "./Login/Login"

interface Props {
    onLobbyIdCreated: (lobbyId: number) => void
}

function CreateGame(props: Props) {
    return (
        <div className="create-game">
            <Login
                onLobbyIdCreated={(id: number) => props.onLobbyIdCreated(id)}
            ></Login>
        </div>
    )
}

export default CreateGame
