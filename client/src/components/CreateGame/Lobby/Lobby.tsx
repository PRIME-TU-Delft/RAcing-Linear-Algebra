import React, { useEffect, useState } from "react"
import "./Lobby.css"

import Steps from "./Steps/Steps"
import TeamInformation from "./TeamInformation/TeamInformation"
import { useNavigate } from "react-router-dom"
import socket from "../../../socket"
import { a, useSpring } from "react-spring"

interface SelectedRound {
    topicName: string,
    roundDuration: number
}

interface Props {
    lobbyId: number // lobby id to display
    onThemeSelected: (theme: string) => void // event called when a theme is selected
    onTeamNameCreated: (name: string) => void // event called when a team name is created
}

function Lobby(props: Props) {
    const [teamName, setTeamName] = useState("New Team")
    const [playerNumber, setPlayerNumber] = useState(0)

    // Entrance animation for the lobby screen
    const spring = useSpring({
        config: { mass: 5, tension: 2000, friction: 200, duration: 500 },
        from: { opacity: 0 },
        to: { opacity: 1 },
    })

    const navigate = useNavigate()

    /**
     * After the start game button is clicked, it navigates to the game screen and informs the server to start the game
     * @param selectedRounds    // rounds selected by the lecturer
     * @param selectedStudy     // study selected by the lecturer
     * @param selectedTheme     // theme selected by the lecturer
     */
    const startGameHandler = (
        selectedRounds: SelectedRound[],
        selectedStudy: string,
        selectedTheme: string
    ) => {
        props.onThemeSelected(selectedTheme)
        navigate("/TeamPreview")
        //Replace teamNameHere with actual teamname
        socket.emit(
            "startGame",
            props.lobbyId,
            selectedRounds.map(x => x.topicName),
            selectedRounds.map(x => x.roundDuration),
            selectedStudy.toUpperCase(),
            teamName
        )
        socket.emit("getAverageFinalScore")
    }

    // Converts the lobby id to string and padds it with 0s if necessary to obtain a 4 number code
    const lobbyCodeConverter = (id: number) => {
        let result = id.toString()
        const length = result.length
        for (let i = 0; i < 4 - length; i++) {
            result = "0" + result
        }
        return result
    }

    // Called when the socket emits an event
    useEffect(() => {
        // Updates the number of players in the lobby
        socket.on("new-player-joined", (players: number) => {
            setPlayerNumber(players)
        })

        // Safety check for if the page is reloaded
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            event.returnValue = "Are you sure you want to leave this page?"
            //shows an alert when try to reload or leave
        }

        window.addEventListener("beforeunload", handleBeforeUnload)

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
            // so the alert only shows once
        }
    }, [socket])

    return (
        <a.div style={spring}>
            {/* TITLE CONTAINING THE LOBBY CODE */}
            <div className="title row align-items-center">
                <div className="lobby-code col">
                    Lobby code: <span>{lobbyCodeConverter(props.lobbyId)}</span>
                </div>

                <TeamInformation
                    playerNumber={playerNumber}
                    teamName={teamName}
                ></TeamInformation>
            </div>

            {/* STEPS TO COMPLETE BEFORE STARTING A GAME */}
            <Steps
                lobbyId={props.lobbyId}
                playerNumber={playerNumber}
                startGameHandler={startGameHandler}
                onNameSelected={(name: string) => {
                    setTeamName((cur) => name)
                    props.onTeamNameCreated(name)
                }}
            ></Steps>
        </a.div>
    )
}

export default Lobby
