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
            title: "Recommended Device",
            content: "It is recommended to play on a desktop, laptop, or tablet."
        },
        {
            title: "First Questions",
            content: "The beginning of each round is composed of a set of mandatory questions that everyone has to answer."
        },
        {
            title: "Team Score",
            content: "The team score is the aggregation of all the individual player scores."
        },
        {
            title: "Choosing Difficulty",
            content: "After the initial mandatory questions, you can choose the difficulty for your next question."
        },
        {
            title: "Streaks",
            content: "Answering multiple questions correctly in a row will result in a streak, giving you bonus points."
        },
        {
            title: "Collaboration",
            content: "You are strongly encouraged to help your classmates when solving the questions. Don't overfocus on your individual score; it's the team score that counts!"
        },
        {
            title: "Race Laps",
            content: "The race laps are color-coded! You can identify a lap based on the color of the outer ring of a team. They go from green, to yellow, to red. And if you perform particularly well, you might even see a few others!"
        },
        {
            title: "Question Attempts",
            content: "The questions have a different number of attempts based on their difficulty. This means you don't always have to be right on the first try!"
        },
        {
            title: "Lecturer's Screen",
            content: "While you will be busy answering the questions, the race will be shown on the lecturer's screen. But don't worry, you will still have a minimap on your screen to get a general idea of the race!"
        },
        {
            title: "The Minimap",
            content: "While answering questions, you will be able to see a minimap on the right of your screen. This reflects the race progress displayed on the lecturer's screen, but in a simplified manner!"
        }        
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
        }, 10000)

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
