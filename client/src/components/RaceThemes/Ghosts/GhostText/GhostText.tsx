import React, { useEffect, useState } from "react"
import { animated, useSpringRef, useTransition } from "react-spring"
import "./GhostText.css"
import { getColorForStudy, getRacePositionText } from "../GhostService"
import { Ghost } from "../../SharedUtils"

interface Props {
    ghost: Ghost,
    showTeamName: boolean
}

function GhostText(props: Props) {
    const [activeTextIndex, setActiveTextIndex] = useState<number>(0)   // index = 0 : race position; index = 1 : team name
    const [racePositionText, setRacePositionText] = useState<string>("")

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
        setRacePositionText(curr => getRacePositionText(props.ghost.racePosition))
    }, [props.ghost.racePosition])

    useEffect(() => {
        transRef.start()
    }, [activeTextIndex])

    return(
        <div>
            {transitions((style, i) => (
                <animated.div style={style} className={(i == 0 ? "position-text" : "team-name-text")}>
                    { i == 0 ? racePositionText : (
                        <div>
                            <span>{props.ghost.study + ":"}</span>{props.ghost.teamName}
                        </div>
                    )}
                </animated.div>
            ))}
        </div>
    )
}

export default GhostText