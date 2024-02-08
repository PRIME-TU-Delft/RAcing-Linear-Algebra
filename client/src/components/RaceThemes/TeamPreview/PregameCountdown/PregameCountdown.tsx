import React, { useEffect, useState } from "react";
import "./PregameCountdown.css"
import { a, useTransition } from "react-spring";

interface Props {
    seconds: number,
    onCountdownComplete: () => void
}

function PregameCountdown(props: Props) {
    const [countdownTextIndex, setCountdownTextIndex] = useState<number>(0)

    useEffect(() => {
        if (countdownTextIndex >= props.seconds) {
            setTimeout(() => props.onCountdownComplete(), 500)
        }
    }, [countdownTextIndex])

    const countdownText = ["Ready.", "Set.", "GO!"]
    const countdownTransition = useTransition(countdownTextIndex, {
        config: { duration: 200 },
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        exitBeforeEnter: true,
        delay: 600,
        onRest: (_springs, _ctrl, item) => {
            if (countdownTextIndex === item) {
              setCountdownTextIndex(curr => curr + 1)
            }
          },
    })
    return(
        <div>
            {countdownTransition((style, itemIndex) => (
                <a.div style={style} className={"team-preview-countdown-text countdown-text-" + itemIndex.toString()}>
                    <div>{countdownText[itemIndex]}</div>
                </a.div>
            ))}
        </div>
    )
}

export default PregameCountdown