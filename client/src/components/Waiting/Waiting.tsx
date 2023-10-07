import React, { useEffect, useState } from "react"
import "./Waiting.css"
import { useNavigate } from "react-router-dom"
import Modal from 'react-modal';
import Boat from "./Themes/Boat"
import BoatBackground from "./Themes/BoatBackground"
import socket from "../../socket"
import Tooltip from "./Tooltip"
import WarningModal from "../WarningModal/WarningModal"
import TrainBackground from "./Themes/TrainBackground"
import Train from "./Themes/Train"

interface Props {
    theme: string
    setTheme: React.Dispatch<React.SetStateAction<string>>
    lobbyId: number
}

function Waiting(props: Props) {
    const navigate = useNavigate()

    const [showPopup, setShowPopup] = useState(false)

    const [countdown, setCountdown] = useState(-1)

    const [warningModalIsOpen, setWarningModalIsOpen] = useState(false)

    const [currentLobbyId, setCurrentLobbyId] = useState(props.lobbyId)

    const backButtonHandler = () => {
        console.log(warningModalIsOpen)
        setWarningModalIsOpen(curr => true)
    }

    const leaveGame = () => {
        console.log(props.lobbyId)
        socket.emit("leaveLobby", props.lobbyId)
        navigate("/")
    }

    useEffect(() => {
        setCurrentLobbyId(curr => props.lobbyId)
    }, [props.lobbyId])

    useEffect(() => {
        // Safety check for if the page is reloaded
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            event.returnValue = "Are you sure you want to leave this page?"
            //shows an alert when try to reload or leave
        }

        window.addEventListener("beforeunload", handleBeforeUnload)

        const countdownInterval = setInterval(() => {
            if (countdown > 1) {
                setCountdown((countdown) => countdown - 1)
            } else if (countdown == 1 || countdown == 0) {
                navigate("/game")
            }
        }, 1000)

        //shows a count down of 3s when game start
        socket.off("round-started").on("round-started", () => {
            setShowPopup(true)
            setCountdown(3)
        })

        //changes theme
        socket.off("themeChange").on("themeChange", (theme: string) => {
            props.setTheme(theme)
        })

        // On load get the current theme
        socket.emit("getTheme")

        return () => {
            clearInterval(countdownInterval)
            window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [socket, countdown])

    return (
        <div className="waiting">
            {props.theme === "Train" ? (
                <>
                    <TrainBackground />
                    <div className="train-container">
                        <Train />
                    </div>
                </>
            ) : (
                <>
                    <BoatBackground />
                    <div className="boat-container">
                        <Boat />
                    </div>
                </>
            )}
            <div className="title-container">
                <div className="custom-loader"></div>
                <div className="waiting-title">
                    Waiting for the lecturer to start
                </div>
            </div>
            <button className={"back-btn" + (props.theme == "Train" ? " train" : "")} onClick={() => backButtonHandler()}>
                <p className={"back-arrow" + (props.theme == "Train" ? " train" : "")}>{"\u2190"}</p>
            </button>
            <div className={`popup ${showPopup ? "show" : ""} `}>
                <div className="popup-content">
                    <p>
                        <span
                            className="countdown-text"
                            data-testid="countdown"
                        >
                            {countdown}
                        </span>
                    </p>
                </div>
            </div>
            <Tooltip />
            {warningModalIsOpen ? (
                <WarningModal
                message="Are you sure you want to quit the game?"
                title="Warning"
                onCloseModal={() => setWarningModalIsOpen(curr => false)}
                onLeaveGame={() => leaveGame()} />
            ) : null}
        </div>
    )
}

export default Waiting
