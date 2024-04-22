import React, { useContext, useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import "./TimeBar.css"
import socket from "../../../socket";
import { TimeContext } from "../../../contexts/TimeContext";

interface Props {
    roundDuration: number
}

function TimeBar(props: Props) {
    const timePassed = useContext(TimeContext);
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
        if ((props.roundDuration - timePassed) / props.roundDuration >= 0.5) return "success"
        else if ((props.roundDuration - timePassed) / props.roundDuration >= 0.25) return "warning"
        else return "danger"
    }

    const getTimeBarStyling = () => {
        if ((props.roundDuration - timePassed) / props.roundDuration >= 0.25) return "time-bar"
        else return "time-bar pulsing-time-bar"
    }

    useEffect(() => {
        const timeInSeconds = props.roundDuration - timePassed
        const minutes = getMinutes(timeInSeconds)
        const seconds = getSeconds(timeInSeconds)
        setTimeText(curr => minutes + ":" + seconds)
    }, [timePassed])

    return(
        <div className="time-container">
            <div className="time-title">Time: {timeText}</div>
            <ProgressBar animated variant={changeTimeBarColorBasedOnTime()} now={((props.roundDuration - timePassed) / props.roundDuration) * 100} className={getTimeBarStyling()}/>

        </div>
    )
}

export default TimeBar