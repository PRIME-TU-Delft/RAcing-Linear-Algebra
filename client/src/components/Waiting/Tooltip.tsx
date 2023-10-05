import React, { useEffect, useState } from "react"
import "./Waiting.css"
import rightArrow from "../../img/right-arrow.png"

export default function Tooltip() {
    const [tips, setTips] = useState<string>("")
    const [tipIndex, setTipIndex] = useState<number>(0)

    const tipsArray = [
        "It is reccomended to play on a desktop, laptop or tablet",
        "The beggining of each round is composed of a set mandatory questions that everyone has to answer",
        "The team score is the average of all the individual scores",
        "After the mandatory questions, you can answer bonus questions where you can choose their difficulty",
        "Answering multiple questions right in a row will provide you with bonus points",
        "You will be competing against other classrooms, so try and help each other as much as possible",
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((index) => {
                const nextIndex = index + 1
                return nextIndex >= tipsArray.length ? 0 : nextIndex
            })
        }, 5000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        setTips(tipsArray[tipIndex])
    }, [tipIndex])

    function nextTip(index: number) {
        if (index === tipsArray.length - 1) {
            setTipIndex(0)
        } else {
            setTipIndex(index + 1)
        }
    }

    function lastTip() {
        if (tipIndex === 0) {
            setTipIndex(tipsArray.length - 1)
        } else {
            setTipIndex((index) => index - 1)
        }
    }

    return (
        <>
            <div className="tooltip-container">
                <div className="tooltip-skip" onClick={lastTip}>
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
                </div>
            </div>
        </>
    )
}
