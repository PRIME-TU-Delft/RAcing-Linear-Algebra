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
    lobbyId: number
}

function Waiting(props: Props) {
    const navigate = useNavigate()

    const [warningModalIsOpen, setWarningModalIsOpen] = useState(false)

    const backButtonHandler = () => {
        setWarningModalIsOpen(curr => true)
    }

    const leaveGame = () => {
        socket.emit("leaveLobby", props.lobbyId)
        navigate("/")
    }

    useEffect(() => {
        // Safety check for if the page is reloaded
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            setTimeout(() => socket.disconnect().connect(), 500)
            event.returnValue = "Are you sure you want to leave this page?"
            //shows an alert when try to reload or leave
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        window.addEventListener("unload", () => socket.disconnect())
        window.addEventListener("load", () => navigate("/"))

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [socket])

    return (
        <div className="waiting">
            {props.theme === "Train" ? (
                <>
                    <TrainBackground includeRail={true}/>
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
            <div className="waiting-title-container">
                <div className="custom-loader"></div>
                <div className="waiting-title">
                    Waiting for the game to start
                </div>
            </div>
            <button className={"back-btn" + (props.theme == "Train" ? " train" : "")} onClick={() => backButtonHandler()}>
                <p className={"back-arrow" + (props.theme == "Train" ? " train" : "")}>{"\u2190"}</p>
            </button>
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