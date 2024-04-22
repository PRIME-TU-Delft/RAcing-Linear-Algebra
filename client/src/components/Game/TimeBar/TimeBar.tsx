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

    return(
        <div className="time-container">
            <div className="time-title">Time:</div>
            <ProgressBar variant="success" now={((props.roundDuration - timePassed) / props.roundDuration) * 100} className="time-bar"/>

        </div>
    )
}

export default TimeBar