import React, { useContext, useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import "./TimeBar.css"
import socket from "../../../socket";
import { TimeContext } from "../../../contexts/TimeContext";

interface Props {
    roundDuration: number
}

function TimeBar(props: Props) {
    const timeLeft = useContext(TimeContext);
    const [timeText, setTimeText] = useState<string>("00:00")

    const getMinutes = (currentTimeInSeconds: number) => {
        const minutes = Math.floor(currentTimeInSeconds / 60)
        let formattedMinutes = minutes.toString()

        if (minutes < 10) formattedMinutes = "0" + formattedMinutes
        return formattedMinutes
    }

    const getSeconds = (currentTimeInSeconds: number) => {
        const seconds = currentTimeInSeconds % 60
        let formattedSeconds = seconds.toString()

        if (seconds < 10) formattedSeconds = "0" + formattedSeconds
        return formattedSeconds
    }

    const changeTimeBarColorBasedOnTime = () => {
        if (timeLeft / props.roundDuration >= 0.5) return "success"
        else if (timeLeft / props.roundDuration >= 0.25) return "warning"
        else return "danger"
    }

    const getTimeBarStyling = () => {
        if (timeLeft >= 10) return "time-bar"
        else return "time-bar pulsing-time-bar"
    }

    useEffect(() => {
        if (timeLeft < props.roundDuration) {
            const minutes = getMinutes(timeLeft)
            const seconds = getSeconds(timeLeft)
            setTimeText(curr => minutes + ":" + seconds)
        }
    }, [timeLeft])

    return(
        <div className="time-container">
            <div className="time-title">Time: {timeText}</div>
            <ProgressBar animated variant={changeTimeBarColorBasedOnTime()} now={(timeLeft / props.roundDuration) * 100} className={getTimeBarStyling()}/>
        </div>
    )
}

export default TimeBar