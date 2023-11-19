import React, { useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import "./TimeBar.css"
import socket from "../../../socket";

function TimeBar() {
    const totalTime = 600
    const [seconds, setSeconds] = useState(totalTime)

    // Timer functionality
    useEffect(() => {
        const interval = setInterval(() => {
            if (seconds > 0) {
                setSeconds((seconds) => seconds - 1)
            } else {
                clearInterval(interval)
            }
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [seconds])

    useEffect(() => {
        socket.off("round-started").on("round-started", () => {

        })
    })
    return(
        <div className="time-container">
            <div className="time-title">Time:</div>
            <ProgressBar variant="success" now={((totalTime - seconds) / totalTime) * 100} className="time-bar"/>

        </div>
    )
}

export default TimeBar