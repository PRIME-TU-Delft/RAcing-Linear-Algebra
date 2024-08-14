import React, { createRef } from "react"
import "./TrueFalseQuestion.css"
import { useEffect, useRef, useState } from "react"
import katex from "katex"
import { useRenderLatex } from "../useRenderLatex"
import socket from "../../../socket"

interface Props {
    latex: string
    questionNum: number
    disableButton: boolean
    theme: string
    questionDifficulty: string
}

export default function TrueFalseQuestion(props: Props) {
    const question = useRenderLatex(props.latex)

    const { questionNum } = props

    function submitAnswer(answer: string) {
        socket.emit("checkAnswer", answer, props.questionDifficulty)
    }

    return (
        <>
            <div className="true-false-question">
                <div
                    className={`question-text-container ${
                        props.theme === "Train"
                            ? "train-theme-container"
                            : "boat-theme-container"
                    }`}
                >
                    <div className="question-num-container">
                        <p
                            className={`question-num ${
                                props.theme === "Train"
                                    ? "train-theme-num"
                                    : "boat-theme-num"
                            }`}
                        >
                            Q{questionNum}
                        </p>
                    </div>
                    <div className="question-text" ref={question}></div>
                </div>
                <div className="flexbox-answers-mc">
                    <button
                        className="answer-mc"
                        id="true-btn"
                        onClick={() => submitAnswer("True")}
                        style={{
                            pointerEvents: props.disableButton
                                ? "none"
                                : "auto",
                        }}
                    >
                        True
                    </button>
                    <button
                        className="answer-mc"
                        id="false-btn"
                        onClick={() => submitAnswer("False")}
                        style={{
                            pointerEvents: props.disableButton
                                ? "none"
                                : "auto",
                        }}
                    >
                        False
                    </button>
                </div>
            </div>
        </>
    )
}
