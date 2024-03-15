import React, { useEffect, useState } from "react";
import "./LapCompletedText.css"
import { a, useTransition } from "react-spring";
import { getColorForRaceLap } from "../../RaceService";

interface Props {
    lapsCompleted: number,
}

function LapCompletedText(props: Props) {
    const [color, setColor] = useState<string>("black")
    const [show, setShow] = useState<boolean>(false)

    useEffect(() => {
        if (props.lapsCompleted > 0) {
            const completedLapColor = getColorForRaceLap(props.lapsCompleted - 1)
            setColor(curr => completedLapColor)

            setShow(curr => true)
            setTimeout(() => {
                setShow(curr => false)
            }, 2000)
        }
    }, [props.lapsCompleted])

    const lapCompletedTextAnimation = useTransition(show, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        delay: 1500
    })

    return(
        <div style={{color: color}}>
            {lapCompletedTextAnimation((style, display) => display ?  (
                <a.div className="lap-completed-text" style={style}>
                    Lap {props.lapsCompleted} completed!
                </a.div>
            ) : null)}
        </div>
    )
}

export default LapCompletedText