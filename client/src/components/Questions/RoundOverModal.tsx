import React, { useEffect, useRef, useState } from "react"
import "./InfoModal.css"
import "./RoundOverModal.css"
import {
    useTransition,
    useSpring,
    useChain,
    animated,
    useSpringRef,
} from "@react-spring/web"

interface Props {
    showRoundOverModal: boolean
    modalAnimation: any
    numOfRightAnswers: number
    numOfWrongAnswers: number
    maxStreak: number
    questionNum: number
}

export default function RoundOverModal(props: Props) {
    const {
        showRoundOverModal,
        modalAnimation,
        numOfRightAnswers,
        numOfWrongAnswers,
        maxStreak,
        questionNum,
    } = props

    return (
        <>
            <div
                className="info-modal-container"
                style={{
                    pointerEvents: showRoundOverModal ? "all" : "none",
                }}
            >
                <animated.div
                    className={`info-modal timeout`}
                    style={modalAnimation}
                >
                    <div className="info-modal-text-container">
                        <p className="info-modal-text1">
                            Round ended! Waiting for lecturer to start new
                            round...
                        </p>
                        <p className="round-modal-text-title"> Your stats </p>
                        <p className="round-modal-text">
                            Questions answered correctly: {numOfRightAnswers}
                        </p>
                        <p className="round-modal-text">
                            Questions answered incorrectly: {numOfWrongAnswers}
                        </p>
                        <p className="round-modal-text">
                            Accuracy:{" "}
                            {Math.floor(
                                (numOfRightAnswers /
                                    (numOfWrongAnswers + numOfRightAnswers)) *
                                    100
                            )}
                            %
                        </p>
                        <p className="round-modal-text">
                            Biggest Streak: {maxStreak}
                        </p>
                    </div>
                </animated.div>
            </div>
        </>
    )
}
