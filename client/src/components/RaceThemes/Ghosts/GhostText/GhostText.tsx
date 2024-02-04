import React, { useEffect, useState } from "react"
import { animated, useSpringRef, useTransition } from "react-spring"
import "./GhostText.css"

interface Props {
    ghostTeamName: string,
    ghostRacePosition: string,
    showTeamName: boolean
}

function GhostText(props: Props) {
    const [activeTextIndex, setActiveTextIndex] = useState<number>(0)   // index = 0 : race position; index = 1 : team name

    const transRef = useSpringRef()
    const transitions = useTransition(activeTextIndex, {
        ref: transRef,
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        exitBeforeEnter: true,
    })

    useEffect(() => {
        if (props.showTeamName) setActiveTextIndex(curr => 1)
        else setActiveTextIndex(curr => 0)
    }, [props.showTeamName])

    useEffect(() => {
        transRef.start()
    }, [activeTextIndex])

    return(
        <div>
            {transitions((style, i) => (
                <animated.div style={style} className={(i == 0 ? "position-text" : "team-name-text")}>
                    { i == 0 ? props.ghostRacePosition : props.ghostTeamName }
                </animated.div>
            ))}
        </div>
    )
}

export default GhostText