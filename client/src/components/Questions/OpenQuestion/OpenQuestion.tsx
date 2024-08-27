import React, { RefObject } from "react"
import "./OpenQuestion.css"
import { useEffect, useRef, useState } from "react"
import katex from "katex"
import QuestionForm from "./QuestionForm"
import socket from "../../../socket"

interface Props {
    latex: string
    questionNum: number
    disableButton: boolean
    theme: string
    questionDifficulty: string
}

function OpenQuestion(props: Props) {
    const { questionNum } = props

    // Reference to the div that will have the question text
    const question: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)

    // Upon rendering parse the latex and display it
    useEffect(() => {
        if (question.current) {
            question.current.innerHTML = renderLatexQuestion(props.latex)
        }
    }, [props.latex])

    // Function to render the latex, the only things that katex renders are between $$..$$ tags
    // the rest is just normal text.
    function renderLatexQuestion(latex: string): string {
        const regex = /\$\$(.*?)\$\$/g
        return latex.replace(regex, (_, equation) => {
            try {
                return katex.renderToString(equation, {
                    throwOnError: false,
                    output: "mathml",
                })
            } catch (error) {
                console.error("Error rendering equation:", equation)
                return ""
            }
        })
    }

    return (
        <>  
            <div className="question-container-open">
                <div
                    className={`question-block-container-open ${
                        props.theme === "Train"
                            ? "train-theme-container"
                            : "boat-theme-container"
                    }`}
                >
                    <div className="question-text-container-open">
                        <div className="question-num-container-open">
                            <p
                                className={`question-num-open ${
                                    props.theme === "Train"
                                        ? "train-theme-num"
                                        : "boat-theme-num"
                                }`}
                            >
                                Q{questionNum}
                            </p>
                        </div>
                        <div
                            className="question-text-open"
                            ref={question}
                        ></div>
                    </div>
                    <QuestionForm
                        latex={props.latex}
                        disableButton={props.disableButton}
                        theme={props.theme}
                        questionDifficulty={props.questionDifficulty}
                    />
                </div>
            </div>
        </>
    )
}

export default OpenQuestion
