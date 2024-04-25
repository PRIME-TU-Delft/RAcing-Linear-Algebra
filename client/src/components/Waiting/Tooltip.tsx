import React, { useEffect, useState } from "react"
import "./Waiting.css"
import rightArrow from "../../img/right-arrow.png"
import StationDisplay from "../RaceThemes/StationDisplay/StationDisplay"
import { title } from "process"

interface Tip {
    title: string,
    content: string
}

export default function Tooltip() {
    const [activeIndices, setActiveIndices] = useState<number[]>([0, 1, 2, 3])

    const tipsArray = [
        {
            title: "Recommended device",
            content: "It is reccomended to play on a desktop, laptop or tablet."
        },
        {
            title: "First questions",
            content: "The beggining of each round is composed of a set mandatory questions that everyone has to answer."
        },
        {
            title: "Team score",
            content: "The team score is the aggregation of all of the individual player scores."
        },
        {
            title: "Choosing difficulty",
            content: "After the initial mandatory questions, you can answer bonus questions where you can choose their difficulty."
        },
        {
            title: "Streaks",
            content: "Answering multiple questions right in a row will result in a streak, giving you bonus points.",
        },
        {
            title: "Collaboration",
            content: "You are strongly encouraged to help your classmates when solving the questions. Don't overfocus on your individual score, it's the team score that counts!",
        },
    ]

    const getNewTipIndex = () => {
        const currentLastIndex = activeIndices[activeIndices.length - 1]
        if (currentLastIndex >= tipsArray.length - 1) return 0
        else return currentLastIndex + 1
    }

    const updateAciveTips = () => {
        const newLastIndex = getNewTipIndex()
        const newActiveIndices = [activeIndices[activeIndices.length - 3], activeIndices[activeIndices.length - 2], activeIndices[activeIndices.length - 1], newLastIndex]
        setActiveIndices(curr => [...newActiveIndices])
    }

    useEffect(() => {
        const interval = setInterval(() => {
            updateAciveTips()
        }, 7000)

        return () => {
            clearInterval(interval)
        }
    }, [activeIndices])

    return (
        <>
            <div className="tooltip-container">
                {/* <div className="tooltip-skip" onClick={lastTip}>
                    <img
                        src={rightArrow}
                        alt="arrow"
                        className="tooltip-left-arrow"
                        data-testid="tooltip-left-arrow"
                    />
                </div>
                <p className="tooltip-text">{tips}</p>
                <div className="tooltip-skip" onClick={() => nextTip(tipIndex)}>
                    <img
                        src={rightArrow}
                        alt="arrow"
                        className="tooltip-right-arrow"
                        data-testid="tooltip-right-arrow"
                    />
                </div> */}
                <StationDisplay
                stations={tipsArray}
                activeIndices={activeIndices}
                nextTip={() => updateAciveTips()}
               ></StationDisplay>
            </div>
        </>
    )
}
