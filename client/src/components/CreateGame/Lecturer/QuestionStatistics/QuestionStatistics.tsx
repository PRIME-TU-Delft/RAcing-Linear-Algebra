import React, { useEffect, useState } from "react"
import "./QuestionStatistics.css"
import socket from "../../../../socket"
import { useTrail, a, useSpring } from "react-spring"
import katex from "katex"

interface Statistic {
    question: string // the text of the question at hand
    answer: string // answer to the question
    difficulty: string // difficulty of the question
    correctlyAnswered: number // number of players who correctly answered the question
    incorrectlyAnswered: number // number of players who incorrectly answered the question
}

interface Props {
    onContinue: () => void
}

function QuestionStatistics(props: Props) {
    const [statistics, setStatistics] = useState<Statistic[]>([])

    /**
     * Renders the latex question to string
     * @param latex     // the latex form of the question
     * @returns         // the string form of the question
     */
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

    function renderLatexAnswer(latex: string): string {
        try {
            return katex.renderToString(latex, {
                throwOnError: false,
                output: "mathml",
            })
        } catch (error) {
            console.error("Error rendering equation:", latex)
            return ""
        }
    }

    // Enter animation for the statistics, created using react-spring
    const enterAnimation = useTrail(statistics.length, {
        config: { mass: 5, tension: 2000, friction: 200 },
        opacity: 1,
        y: 20,
        from: { opacity: 0, y: 0 },
    })

    // Listens for events from the socket
    useEffect(() => {
        // When statistics are received, filters them based on number of attempts and sorts them based on accuracy and difficulty
        socket.on("statistics", (data: string) => {
            const parsedStatistics: Statistic[] = JSON.parse(data)
            setStatistics((curr) => parsedStatistics)
        })
    }, [socket])

    return (
        <div>
            <div className="question-statistics-title">
                Question Statistics
            </div>
            <div className="question-statistics-continue" onClick={() => props.onContinue()}>
                Continue
            </div>
            {enterAnimation.map(({ ...style }, index) => (
                <a.div key={index} className="question-statistic" style={style}>
                    <div className="row">
                        <div
                            className="col-8 text"
                            dangerouslySetInnerHTML={{
                                __html: renderLatexQuestion(
                                    statistics[index].question
                                ),
                            }}
                        ></div>
                        <div className="col-4 stats">
                            <div className="row">
                                <div className="row accuracy">
                                    Wrong attempts:{" "}
                                        {statistics[index].incorrectlyAnswered}
                                </div>
                            </div>
                            <div className="row">
                                <div className="row total-attemptys">
                                    Accuracy:{" "}
                                        {(
                                            (statistics[index].correctlyAnswered /
                                                (statistics[index]
                                                    .correctlyAnswered +
                                                    statistics[index]
                                                        .incorrectlyAnswered)) *
                                            100
                                        )
                                            .toString()
                                            .slice(0, 5)}
                                        %
                                </div>
                            </div>
                            <div className="row difficulty">
                                    Difficulty:{" "}
                                    {statistics[index].difficulty
                                        .charAt(0)
                                        .toUpperCase() +
                                        statistics[index].difficulty.slice(1)}
                            </div>
                        </div>
                    </div>
                    <div className="row question-answer">
                        <div className="col-1 answer-title">Answer:</div>
                        <div
                            className="col-11 answer-value"
                            dangerouslySetInnerHTML={{
                                __html: renderLatexAnswer(
                                    statistics[index].answer
                                ),
                            }}
                        ></div>
                    </div>
                </a.div>
            ))}
        </div>
    )
}

export default QuestionStatistics
