import React, { useEffect, useState } from "react";
import "./PowerUpElement.css";
import { PowerUp } from "../PowerUpUtils";
import { Typography } from "@mui/material";

interface Props {
    onClick: () => void
    powerUp: PowerUp
    onPowerUpExpired: () => void
}

function PowerUpElement(props: Props) {
    const [timeFormatted, setTimeFormatted] = useState("00:00");

    useEffect(() => {
        if (!props.powerUp.expiryTime) return

        const updateTime = () => {
            const timeLeft = (props.powerUp.expiryTime ? props.powerUp.expiryTime : 0) - Date.now()
            const totalSeconds = Math.max(Math.floor(timeLeft / 1000), 0)

            if (totalSeconds === 0) {
                setTimeFormatted("00:00");
                props.onPowerUpExpired();
                if (interval) {
                    clearInterval(interval);
                }
            } else {
                const minutes = Math.floor(totalSeconds / 60)
                const seconds = totalSeconds % 60
                const formatted = `${minutes.toString().padStart(2, "0")}:${seconds
                    .toString()
                    .padStart(2, "0")}`
                setTimeFormatted(formatted)
            }
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)
        return () => clearInterval(interval)
    }, [props.powerUp.expiryTime])

    const animateIfExpiring = () => {
        if (!props.powerUp.expiryTime) return ""
        const timeLeft = (props.powerUp.expiryTime ? props.powerUp.expiryTime : 0) - Date.now()
        const totalSeconds = Math.max(Math.floor(timeLeft / 1000), 0)

        if (totalSeconds <= 10) { 
            return "power-up-expiring"
        } else {
            return ""
        }
    }

    return (
        <div className={"power-up-element " + animateIfExpiring()} onClick={props.onClick}>
            <div className="expiry-timer">
                {timeFormatted}
            </div>
        </div>
    )
}

export default PowerUpElement;