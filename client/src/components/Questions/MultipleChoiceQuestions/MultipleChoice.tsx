import React, { createRef } from "react"
import "./MultipleChoice.css"
import { useEffect, useRef, useState } from "react"
import katex from "katex"
import { useRenderLatex, renderLatex } from "../useRenderLatex"
import { getQuestionsRoute } from "../../../utils/APIRoutes"
import { IQuestion } from "../Question"
import socket from "../../../socket"

interface Props {
    latex: string
    answers: string[]
    questionNum: number
    disableButton: boolean
    theme: string
}

function MultipleChoice(props: Props) {
    const { questionNum } = props
    const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([])

    // Reference to the div that will have the question text
    const question = useRenderLatex(props.latex)
    const answerRefs = props.answers.map(() => createRef<HTMLDivElement>())

    // Upon rendering parse the latex and display it for the answers. This will also dinamically
    // render divs according to the number of answers available.
    useEffect(() => {
        console.log("HERE")
        console.log(props.answers)
        if (props.answers === undefined) return
        const newShuffling = shuffleArray(props.answers)
        
        newShuffling.forEach((answer, index) => {
            const ref = answerRefs[index].current
            if (ref) {
                ref.innerHTML = renderLatex(answer)
            }
        })
        setShuffledAnswers(curr => [...newShuffling])
    }, [props.answers])

    /**
     * Gets all the answers and randomly generates positions for them
     * @param array all the options for this questions represented as an array
     * @returns new array with the options shuffled
     */
    function shuffleArray(array: string[]) {
        const shuffledArray = [...array]
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = shuffledArray[i]
            shuffledArray[i] = shuffledArray[j]
            shuffledArray[j] = temp
        }
        return shuffledArray
    }

    function submitAnswer(answer: string | number | undefined) {
        if (answer !== undefined) {
            socket.emit("checkAnswer", answer)
        }
    }

    return (
        <>
            <div className="question-container-mc">
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
                <div className="flexbox-answers">
                    {props.answers &&
                        props.answers.map((answer, index) => (
                            <button
                                className="answer"
                                key={index}
                                onClick={() =>{
                                        console.log("GOTYA")
                                        console.log(shuffledAnswers)
                                        console.log(index)
                                        submitAnswer(shuffledAnswers[index])
                                }
                                }
                                style={{
                                    pointerEvents: props.disableButton
                                        ? "none"
                                        : "auto",
                                }}
                            >
                                <div
                                    className="answer-letter"
                                    id={`answer${index + 1}`}
                                >
                                    {String.fromCharCode(65 + index)}
                                </div>
                                <div
                                    className="answer-text"
                                    ref={answerRefs[index]}
                                    data-testid={`answer-${index + 1}`}
                                ></div>
                            </button>
                        ))}
                </div>
            </div>
        </>
    )
}

export default MultipleChoice
