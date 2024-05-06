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
    hideQuestion: boolean,
    theme: string,
    getQuestionNumber: (questionNumber: number) => void,
    getQuestionAnswer: (questionAnswer: string) => void,
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

    const [showPopup, setShowPopup] = useState(false)

    const [countdown, setCountdown] = useState(-1)

    const navigate = useNavigate()

    // All the socket events for the questions are handled here
    useEffect(() => {
        
        socket.emit("getNewQuestion") // Get the first question

        socket.off("chooseDifficulty").on("chooseDifficulty", () => {
            setDisableButton(true)
            // Wait for the info modal to be closed
            setTimeout(() => {
                setShowDifficulty(true)
                setDisableButton(false)
            }, 1500)
        })

        socket
            .off("get-next-question")
            .on("get-next-question", (questionReceived: IQuestion) => {
                setQuestionNum((questionNum) => questionNum + 1)
                setQuestion(questionReceived)
            })
    }, [])

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

    useEffect(() => {
        props.getQuestionNumber(questionNum)
    }, [questionNum])

    useEffect(() => {
        props.getQuestionAnswer(question.answer)
    }, [question])

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
        [0, showInfoModal ? 0.1 : 0.1]
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
        [0, showRoundOverModal ? 0.1 : 0.1]
    )

    return (
           <animated.div
                className="question-container"
                style={bodyAnimation}
                data-testid="question-container"
            >
                <DifficultySelection
                    open={showDifficulty}
                    onDifficultySelected={() => setShowDifficulty(curr => false)}
                    type={question.subject}
                ></DifficultySelection>
                {!showDifficulty && !disableButton && !props.hideQuestion ? 
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
                                        answers={question.options ? question.options : []}
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
    )
}

export default Question
