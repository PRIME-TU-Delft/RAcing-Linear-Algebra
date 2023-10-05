import React, { useEffect, useState } from "react"
import "./Waiting.css"
import { useNavigate } from "react-router-dom"
import Boat from "./Themes/Boat"
import BoatBackground from "./Themes/BoatBackground"
import socket from "../../socket"
import Tooltip from "./Tooltip"
import TrainBackground from "./Themes/TrainBackground"
import Train from "./Themes/Train"

interface Props {
    theme: string
    setTheme: React.Dispatch<React.SetStateAction<string>>
}

function Waiting(props: Props) {
    const navigate = useNavigate()

    const [showPopup, setShowPopup] = useState(false)

    const [countdown, setCountdown] = useState(-1)

    useEffect(() => {
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
            <button className="back-btn" onClick={() => navigate("/")}>
                <p className="back-arrow">{"\u2190"}</p>
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
        </div>
    )
}

export default Waiting
