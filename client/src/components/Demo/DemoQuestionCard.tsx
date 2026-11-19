import React, { useEffect, useRef, useState } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"
import { DemoQuestion, DIFFICULTY_SETTINGS, isCorrect } from "./demoQuestions"

/** Renders text with inline LaTeX between $$..$$ */
export function DemoLatex(props: { text: string; className?: string }) {
    const html = props.text.replace(/\$\$(.*?)\$\$/g, (_, equation) =>
        katex.renderToString(equation, { throwOnError: false })
    )
    return <div className={props.className} dangerouslySetInnerHTML={{ __html: html }} />
}

const DIFFICULTY_LABELS: Record<string, string> = {
    mandatory: "Warm-up 🏁",
    easy: "Easy 😃",
    medium: "Medium 😐",
    hard: "Hard 😈",
}

interface Props {
    question: DemoQuestion
    questionNumber: number
    pointsToGain: number
    /** Called as soon as the outcome is known: answered correctly, or all attempts used */
    onOutcome: (correct: boolean) => void
    /** Called when the player is ready to move on to the next question */
    onContinue: () => void
}

type Status = "answering" | "correct" | "wrong-retry" | "failed"

function DemoQuestionCard(props: Props) {
    const maxAttempts = DIFFICULTY_SETTINGS[props.question.difficulty].attempts
    const [attemptsLeft, setAttemptsLeft] = useState(maxAttempts)
    const [status, setStatus] = useState<Status>("answering")
    const [input, setInput] = useState("")
    const [wrongOptions, setWrongOptions] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setAttemptsLeft(maxAttempts)
        setStatus("answering")
        setInput("")
        setWrongOptions([])
        setTimeout(() => inputRef.current?.focus(), 50)
    }, [props.question.id])

    const submit = (answer: string) => {
        if (status === "correct" || status === "failed") return
        if (answer.trim() === "") return

        if (isCorrect(props.question, answer)) {
            setStatus("correct")
            props.onOutcome(true)
            setTimeout(() => props.onContinue(), 1300)
            return
        }

        const remaining = attemptsLeft - 1
        setAttemptsLeft(remaining)
        if (props.question.type === "mc") setWrongOptions((curr) => [...curr, answer])
        if (remaining <= 0) {
            setStatus("failed")
            props.onOutcome(false)
        } else {
            setStatus("wrong-retry")
            setInput("")
            inputRef.current?.focus()
        }
    }

    const finished = status === "correct" || status === "failed"

    return (
        <div className="demo-question-card">
            <div className="demo-question-chips">
                <span className="demo-chip">Question {props.questionNumber}</span>
                <span className="demo-chip demo-chip-blue">{DIFFICULTY_LABELS[props.question.difficulty]}</span>
                <span className="demo-chip demo-chip-blue">+{props.pointsToGain} pts</span>
                <span className="demo-chip demo-chip-light">
                    {attemptsLeft} {attemptsLeft === 1 ? "try" : "tries"} left
                </span>
            </div>

            <DemoLatex className="demo-question-prompt" text={props.question.prompt} />

            {props.question.type === "mc" ? (
                <div className={`demo-mc-grid ${props.question.options!.length === 2 ? "demo-mc-two" : ""}`}>
                    {props.question.options!.map((option) => {
                        const isAnswer = option === props.question.answer
                        let className = "demo-mc-option"
                        if (wrongOptions.includes(option)) className += " demo-mc-wrong"
                        if (finished && isAnswer) className += " demo-mc-right"
                        return (
                            <button
                                key={option}
                                className={className}
                                disabled={finished || wrongOptions.includes(option)}
                                onClick={() => submit(option)}
                            >
                                {option}
                            </button>
                        )
                    })}
                </div>
            ) : (
                <form
                    className="demo-numeric-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        submit(input)
                    }}
                >
                    <input
                        ref={inputRef}
                        className="demo-numeric-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={finished}
                        placeholder="Your answer"
                        inputMode="decimal"
                        autoComplete="off"
                    />
                    <button className="demo-submit-btn" type="submit" disabled={finished || input.trim() === ""}>
                        Check
                    </button>
                </form>
            )}

            <div className="demo-feedback-area">
                {status === "correct" && (
                    <div className="demo-feedback demo-feedback-correct">✔️ Correct! +{props.pointsToGain} points</div>
                )}
                {status === "wrong-retry" && (
                    <div className="demo-feedback demo-feedback-retry">
                        ❌ Not quite. {attemptsLeft} {attemptsLeft === 1 ? "attempt" : "attempts"} left
                    </div>
                )}
                {status === "failed" && (
                    <div className="demo-feedback demo-feedback-failed">
                        <div>
                            ❌ Out of attempts. The answer is{" "}
                            <b>{props.question.type === "mc" ? props.question.answer : String(props.question.answer)}</b>
                        </div>
                        <DemoLatex className="demo-explanation" text={props.question.explanation} />
                        <button className="demo-submit-btn" autoFocus onClick={props.onContinue}>
                            Next question »
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DemoQuestionCard
