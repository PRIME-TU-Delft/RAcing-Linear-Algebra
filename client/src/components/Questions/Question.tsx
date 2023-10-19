import React, { useEffect, useState } from "react"
import "./Question.css"
import MultipleChoice from "./MultipleChoiceQuestions/MultipleChoice"
import OpenQuestion from "./OpenQuestion/OpenQuestion"
import TrueFalseQuestion from "./MultipleChoiceQuestions/TrueFalseQuestion"
import QuestionBoatBackground from "./Themes/QuestionBoatBackground"
import DifficultySelection from "./DifficultySelection/DifficultySelection"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import socket from "../../socket"
import InfoModal from "./InfoModal"
import {
    useSpring,
    config,
    animated,
    useSpringRef,
    useChain,
} from "@react-spring/web"
import RoundOverModal from "./RoundOverModal"
import QuestionTrainBackground from "./Themes/QuestionTrainBackground"
import { useNavigate } from "react-router-dom"

export interface IQuestion {
    question: string
    answer: string
    difficulty: string
    subject: string
    type: string
    options?: string[]
    variants?: any[]
}

interface Props {
    theme: string
}

interface Statistic {
    question: string
    answer: string
    difficulty: string
    correctlyAnswered: number
    incorrectlyAnswered: number
}

function Question(props: Props) {
    const [question, setQuestion] = useState<IQuestion>({
        question: "",
        answer: "",
        difficulty: "",
        subject: "",
        type: "",
        options: [],
    })
    const [mandatoryNum, setMandatoryNum] = useState(0)

    const [showPopup, setShowPopup] = useState(false)

    const [countdown, setCountdown] = useState(-1)

    const navigate = useNavigate()

    // All the socket events for the questions are handled here
    useEffect(() => {
        // Safety check for if the page is reloaded
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            socket.disconnect().connect()
            event.returnValue = "Are you sure you want to leave this page?"
            //shows an alert when try to reload or leave
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        window.addEventListener("unload", () => socket.disconnect())
        window.addEventListener("load", () => navigate("/"))
        
        socket.emit("getMandatoryNum")
        socket.emit("getNewQuestion") // Get the first question

        socket.off("chooseDifficulty").on("chooseDifficulty", () => {
            setDisableButton(true)
            // Wait for the info modal to be closed
            setTimeout(() => {
                setShowDifficulty(true)
                setDisableButton(false)
            }, 4500)
        })

        socket
            .off("get-next-question")
            .on("get-next-question", (questionReceived: IQuestion) => {
                setQuestionNum((questionNum) => questionNum + 1)
                setQuestion(questionReceived)
            })

        socket.off("round-ended").on("round-ended", () => {
            setShowDifficulty(false)
            setShowInfoModal(false)
            setShowRoundOverModal(true)
            socket.emit("getResults")
        })

        socket.off("round-started").on("round-started", () => {
            setShowDifficulty(false)
            setShowInfoModal(false)
            setScore(0)
            setRightAnswers(0)
            setWrongAnswers(0)
            setStreak(0)
            setQuestionNum(0)
            setMaxStreak(0)
            socket.emit("getNewQuestion")
            socket.emit("getMandatoryNum")
            setShowRoundOverModal(false)
            setShowPopup(true)
            setCountdown(3)
        })

        socket.off("result").on("result", (result: string) => {
            calculateStats(JSON.parse(result))
        })

        socket.off("mandatoryNum").on("mandatoryNum", (num: number) => {
            setMandatoryNum(num)
        })

        socket.off("end-game").on("end-game", () => {
            navigate("/endGame")
        })
    }, [])

    useEffect(() => {
        if (questionNum > 2) {
            setScoreToAdd((cur) => 0)
        }

        socket.off("rightAnswer").on("rightAnswer", (score: number) => {
            // What happens if the answer is correct
            setModalText(["✔️ Your answer is correct!"])
            setModalType("correctAnswer")
            setScoreToAdd((cur) => score)
            setRightAnswers((rightAnswers) => rightAnswers + 1)
            setStreak((streak) => streak + 1)
            setShowInfoModal(true)
            if (questionNum < mandatoryNum) socket.emit("getNewQuestion")
        })

        socket.off("wrongAnswer").on("wrongAnswer", (triesLeft: number) => {
            // What happens if the answer is incorrect and you have no tries left
            setModalText([
                "❌ Your answer is incorrect! The correct answer is:",
            ])
            if (triesLeft === 0) {
                setModalType("incorrectAnswer")
                setModalAnswer(question.answer)
                setStreak(0)
                setScoreToAdd(0)
                setWrongAnswers((wrongAnswers) => wrongAnswers + 1)
                setShowInfoModal(true)
                if (questionNum < mandatoryNum) socket.emit("getNewQuestion")
            } else {
                wrongAnswerToast(triesLeft)
            }
        })
    }, [question])

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            if (countdown > 1) {
                setCountdown((countdown) => countdown - 1)
            } else if (countdown == 1 || countdown == 0) {
                setShowPopup((cur) => false)
            }
        }, 1000)
        return () => {
            clearInterval(countdownInterval)
        }
    }, [countdown])

    // Variable to display the difficulty selection screen
    const [showDifficulty, setShowDifficulty] = useState<boolean>(false)
    // Variable to display the info modal
    const [showInfoModal, setShowInfoModal] = useState<boolean>(false)
    // Varaible to display the round over modal
    const [showRoundOverModal, setShowRoundOverModal] = useState<boolean>(false)
    // This will be used to disable the submit button for a short period of time when the user submits an answer
    const [disableButton, setDisableButton] = useState<boolean>(false)
    // Used to track when to not call get new question, because of the difficulty selection screen
    const [rightAnswers, setRightAnswers] = useState<number>(0)
    const [wrongAnswers, setWrongAnswers] = useState<number>(0)
    const [streak, setStreak] = useState<number>(0) // Streak of the user
    const [maxStreak, setMaxStreak] = useState<number>(0) // Max streak of the user
    const [score, setScore] = useState<number>(0) // Total score of the user
    const [scoreToAdd, setScoreToAdd] = useState<number>(0) // Score gained for the current question
    const [questionNum, setQuestionNum] = useState<number>(0) // Number of the current question
    const [numOfQuestions, setNumOfQuestions] = useState<number>(0) // Number of questions in the round

    // Variables to dinamically decide what to display on info modal
    const [modalText, setModalText] = useState<string[]>([])
    const [modalType, setModalType] = useState<string>("")
    const [modalAnswer, setModalAnswer] = useState<string>("")

    // Update the score when the scoreToAdd variable changes
    useEffect(() => {
        setScore((score) => score + scoreToAdd)
    }, [scoreToAdd])

    useEffect(() => {
        // if (streak === 0) setScoreToAdd(0)
        // else setScoreToAdd(100 * (1 + (streak - 1) / 10))
        if (streak > maxStreak) setMaxStreak(streak)
    }, [streak])

    function wrongAnswerToast(triesLeft: number) {
        setDisableButton(true)
        // Enable the button after 1 second
        setTimeout(() => {
            setDisableButton(false)
        }, 2000)
        toast(
            `❌ Your answer is incorrect. You have ${triesLeft} attempts left`,
            {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "light",
            }
        )
    }

    function calculateStats(statistic: Statistic[]) {
        let rightAnswers = 0
        let wrongAnswers = 0
        for (const stat of statistic) {
            if (stat.correctlyAnswered === 1) rightAnswers++
            else if (stat.incorrectlyAnswered !== 0) wrongAnswers++
        }
        setRightAnswers(rightAnswers)
        setWrongAnswers(wrongAnswers)
        setNumOfQuestions(rightAnswers + wrongAnswers)
    }

    // Animations
    const bodyAnimationRef = useSpringRef()
    const bodyAnimation = useSpring({
        ref: bodyAnimationRef,
        config: config.stiff,
        from: {
            scale: showInfoModal || showRoundOverModal ? 1 : 2,
            opacity: showInfoModal || showRoundOverModal ? 1 : 0,
            pointerEvent: "all",
            overflow: "hidden",
        },
        to: {
            scale: showInfoModal || showRoundOverModal ? 0 : 1,
            opacity: showInfoModal || showRoundOverModal ? 0 : 1,
            pointerEvent: showInfoModal || showRoundOverModal ? "none" : "all",
            overflow: "hidden",
        },
    })

    const modalAnimationRef = useSpringRef()
    const modalAnimation = useSpring({
        ref: modalAnimationRef,
        config: config.stiff,
        from: {
            scale: 0,
            opacity: 0,
            size: "0%",
            pointerEvents: "none",
        },
        to: {
            scale: showInfoModal ? 1 : 0,
            opacity: showInfoModal ? 1 : 0,
            size: showInfoModal ? 1 : "0%",
            pointerEvents: showInfoModal ? "all" : "none",
        },
    })

    useChain(
        showInfoModal
            ? [bodyAnimationRef, modalAnimationRef]
            : [modalAnimationRef, bodyAnimationRef],
        [0, showInfoModal ? 0.3 : 0.1]
    )

    const modalAnimationRef2 = useSpringRef()
    const modalAnimation2 = useSpring({
        ref: modalAnimationRef2,
        config: config.stiff,
        from: {
            scale: 0,
            opacity: 0,
            size: "0%",
            pointerEvents: "none",
        },
        to: {
            scale: showRoundOverModal ? 1 : 0,
            opacity: showRoundOverModal ? 1 : 0,
            size: showRoundOverModal ? 1 : "0%",
            pointerEvents: showRoundOverModal ? "all" : "none",
        },
    })

    useChain(
        showRoundOverModal
            ? [bodyAnimationRef, modalAnimationRef2]
            : [modalAnimationRef2, bodyAnimationRef],
        [0, showRoundOverModal ? 0.3 : 0.1]
    )

    return (
        <>
            {props.theme === "Train" ? (
                <QuestionTrainBackground />
            ) : (
                <QuestionBoatBackground />
            )}
            <div className="question-header">
                <div className="score"> Score: {Math.floor(score)}</div>
            </div>
            <animated.div
                className="question-container"
                style={bodyAnimation}
                data-testid="question-container"
            >
                <DifficultySelection
                    open={showDifficulty}
                    setOpen={setShowDifficulty}
                    type={question.subject}
                ></DifficultySelection>
                {!showDifficulty && !disableButton ? 
                    <div>
                        {question !== null && (
                            <>
                                {question.type === "open" ||
                                question.type === "open-infinite" ? (
                                    <OpenQuestion
                                        latex={question.question}
                                        questionNum={questionNum}
                                        disableButton={disableButton}
                                        theme={props.theme}
                                    />
                                ) : question.type === "mc" ? (
                                    <MultipleChoice
                                        latex={question.question}
                                        answers={[...(question.options ?? [])]}
                                        questionNum={questionNum}
                                        disableButton={disableButton}
                                        theme={props.theme}
                                    />
                                ) : question.type === "true/false" ? (
                                    <TrueFalseQuestion
                                        latex={question.question}
                                        questionNum={questionNum}
                                        disableButton={disableButton}
                                        theme={props.theme}
                                    />
                                ) : null}
                            </>
                        )}
                    </div> 
                : null}
            </animated.div>
            <InfoModal
                showInfoModal={showInfoModal}
                setShowInfoModal={setShowInfoModal}
                modalAnimation={modalAnimation}
                modalText={modalText}
                type={modalType}
                correctAnswer={modalAnswer}
                streak={streak}
                scoreToAdd={scoreToAdd}
                questionType={question?.type}
            />
            <RoundOverModal
                showRoundOverModal={showRoundOverModal}
                modalAnimation={modalAnimation2}
                numOfRightAnswers={rightAnswers}
                numOfWrongAnswers={wrongAnswers}
                maxStreak={maxStreak}
                questionNum={numOfQuestions}
            />
            <ToastContainer />
            <div className={`popup ${showPopup ? "show" : ""}`}>
                <div className="popup-content">
                    <p>
                        <span className="countdown-text">{countdown}</span>
                    </p>
                </div>
            </div>
        </>
    )
}

export default Question
