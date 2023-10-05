import React, { useEffect, useRef, useState } from "react"
import "./InfoModal.css"
import {
    useTransition,
    useSpring,
    useChain,
    animated,
    useSpringRef,
} from "@react-spring/web"
import { ProgressBar } from "react-bootstrap"
import { renderLatex, useRenderLatex } from "./useRenderLatex"

interface Props {
    setShowInfoModal: React.Dispatch<React.SetStateAction<boolean>>
    showInfoModal: boolean
    modalAnimation: any
    // This is used to determine what type of information will be displayed in the modal
    type: string
    modalText: string[]
    correctAnswer: string
    streak: number
    scoreToAdd: number
    questionType: string
}
/*
 * This is a multi-use modal, it will be used to display information if the answer is correct, incorrect
 * or if the round ended. In case it is incorrect it will also display the correct answer.
 */
export default function InfoModal(props: Props) {
    const {
        showInfoModal: showInfoModal,
        setShowInfoModal: setShowCorrectnessModal,
        modalAnimation,
        type,
        modalText,
        streak,
        scoreToAdd,
    } = props

    const correctAnswerRef =
        props.questionType === "mc"
            ? useRenderLatex(props.correctAnswer)
            : useRenderLatex(`$$${props.correctAnswer}$$`)

    // Progress bar functionality
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        if (!showInfoModal) return
        const interval = setInterval(() => {
            setProgress((prevProgress) => prevProgress - 1)
        }, 30) // Update progress every 30 milliseconds

        // Clear interval after 3 seconds
        setTimeout(() => {
            setProgress(0)
            setShowCorrectnessModal(false)
            setProgress(100)
        }, 3500)

        return () => {
            clearInterval(interval)
        }
    }, [showInfoModal])

    useEffect(() => {
        if (correctAnswerRef.current) {
            correctAnswerRef.current.innerHTML =
                props.questionType === "mc"
                    ? renderLatex(props.correctAnswer)
                    : renderLatex(`$$${props.correctAnswer}$$`)
        }
    }, [props.correctAnswer])

    return (
        <>
            <div
                className="info-modal-container"
                style={{
                    pointerEvents: showInfoModal ? "all" : "none",
                }}
            >
                <animated.div
                    className={`info-modal ${
                        type === "correctAnswer"
                            ? "correct-answer"
                            : type === "incorrectAnswer"
                            ? "incorrect-answer"
                            : ""
                    }`}
                    style={modalAnimation}
                >
                    <div className="info-modal-text-container">
                        <p className="info-modal-text1">{modalText[0]}</p>
                        {type === "incorrectAnswer" ||
                        type === "correctAnswer" ? (
                            <>
                                <div
                                    className="correct-answer-display"
                                    ref={correctAnswerRef}
                                    style={{
                                        opacity:
                                            type === "incorrectAnswer" ? 1 : 0,
                                    }}
                                ></div>
                                <p className="info-modal-text2">
                                    Points Gained: {Math.floor(scoreToAdd)}
                                </p>
                                <p className="info-modal-text3">
                                    Current Streak: {streak}
                                </p>
                            </>
                        ) : null}
                    </div>
                    <ProgressBar
                        variant="info"
                        now={progress}
                        className="info-progress-bar"
                    ></ProgressBar>
                </animated.div>
            </div>
        </>
    )
}
