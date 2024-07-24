import React, { useContext, useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import RoundOverModal from "../Questions/RoundOverModal";
import InfoModal from "../Questions/InfoModal";
import TeamStats from "./TeamStats/TeamStats";
import TimeBar from "./TimeBar/TimeBar";
import QuestionTrainBackground from "../Questions/Themes/QuestionTrainBackground";
import { animated, config, useChain, useSpring, useSpringRef } from "react-spring";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import QuestionBoatBackground from "../Questions/Themes/QuestionBoatBackground";
import "./Game.css"
import Question from "../Questions/Question";
import { getRacePathObject } from "../RaceThemes/RaceService";
import { RacePathObject } from "../RaceThemes/SharedUtils";
import { RaceDataContext } from "../../contexts/RaceDataContext";
import useWindowDimensions from "../RaceThemes/Tracks/WindowDimensions";
import RaceStatus from "../RaceThemes/RaceStatus/RaceStatus";
import { RacePathContext } from "../../contexts/RacePathContext";
import Tracks from "../RaceThemes/Tracks/Tracks";
import { getRacePathSizeAndOffsetMargins } from "./GameService";
import { QuestionContext } from "../../contexts/QuestionContext";
import ColorationInfo from "../ColorationInfo/ColorationInfo";
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'

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
    roundDuration: number
    roundStarted: boolean
    onRoundEnded: () => void
}

interface Statistic {
    question: string
    answer: string
    difficulty: string
    correctlyAnswered: number
    incorrectlyAnswered: number
}

function Game(props: Props) {
    const width = window.innerWidth
    const height = window.innerHeight
    const racePathSizing = getRacePathSizeAndOffsetMargins(width, height)
    const raceData = useContext(RaceDataContext)
    const racePath: RacePathObject = useMemo(() => getRacePathObject(raceData.selectedMap.path, racePathSizing.width, racePathSizing.height), [raceData.selectedMap, height, width]) // multiple maps may be used in the future, currently only one exists
    const questionData = useContext(QuestionContext)

    const [showPopup, setShowPopup] = useState(false)

    const [countdown, setCountdown] = useState(-1)

    const navigate = useNavigate()

     // Safety check for if the page is reloaded
     const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault()
        setTimeout(() => socket.disconnect().connect(), 500)
        event.returnValue = "Are you sure you want to leave this page?"
        //shows an alert when try to reload or leave
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("unload", () => socket.disconnect())
    window.addEventListener("load", () => navigate("/"))

    socket.emit("getMandatoryNum")

    function show_notification() {
        Store.addNotification({
            title: "Color Coding",
            message: "Click the information button to learn about the game's color coding!",
            type: "info",
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
        });
    }

    useEffect(() => {
        setShowInfoModal(false)
        setScore(0)
        setRightAnswers(0)
        setWrongAnswers(0)
        setStreak(0)
        setMaxStreak(0)
        setShowRoundOverModal(false)
        setShowPopup(true)
        setCountdown(3)
        show_notification()
    }, [props.roundStarted])

    useEffect(() => {
        socket.off("round-ended").on("round-ended", () => {
            setShowInfoModal(false)
            setShowRoundOverModal(true)
            socket.emit("getResults")
            props.onRoundEnded()
        })

        socket.off("rightAnswer").on("rightAnswer", (score: number) => {
            // What happens if the answer is correct
            setModalText(["✔️ Your answer is correct!"])
            setModalType("correctAnswer")
            setScoreToAdd((cur) => score)
            setRightAnswers((rightAnswers) => rightAnswers + 1)
            setStreak((streak) => streak + 1)
            setShowInfoModal(true)
            if (questionData.questionNumber < questionData.numberOfMandatory) socket.emit("getNewQuestion")
        })

        socket.off("wrongAnswer").on("wrongAnswer", (triesLeft: number) => {
            // What happens if the answer is incorrect and you have no tries left
            setModalText([
                "❌ Your answer is incorrect! The correct answer is:",
            ])
            if (triesLeft === 0) {
                setModalType("incorrectAnswer")
                setModalAnswer(questionData.iQuestion.answer)
                setStreak(0)
                setScoreToAdd(0)
                setWrongAnswers((wrongAnswers) => wrongAnswers + 1)
                setShowInfoModal(true)
                if (questionData.questionNumber < questionData.numberOfMandatory) socket.emit("getNewQuestion")
            } else {
                wrongAnswerToast(triesLeft)
            }
        })

        socket.off("result").on("result", (result: string) => {
            calculateStats(JSON.parse(result))
        })

        socket.off("end-game").on("end-game", () => {
            navigate("/endGame")
        })
    }, [socket, questionData.questionNumber, questionData.numberOfMandatory])

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

    useEffect(() => {
        if (questionData.questionNumber > 2) {
            setScoreToAdd(curr => 0)
        }
    }, [questionData.questionNumber])

    // Variable to display the info modal
    const [showInfoModal, setShowInfoModal] = useState<boolean>(false)
    // Variable to inform the question screen that difficulty selection should not appear
    const [hideQuestion, setHideQuestion] = useState<boolean>(false)
    const [answeredQuestionType, setAnsweredQuestionType] = useState("mc")
    // Varaible to display the round over modal
    const [showRoundOverModal, setShowRoundOverModal] = useState<boolean>(false)
    // Used to track when to not call get new question, because of the difficulty selection screen
    const [rightAnswers, setRightAnswers] = useState<number>(0)
    const [wrongAnswers, setWrongAnswers] = useState<number>(0)
    const [streak, setStreak] = useState<number>(0) // Streak of the user
    const [maxStreak, setMaxStreak] = useState<number>(0) // Max streak of the user
    const [score, setScore] = useState<number>(0) // Total score of the user
    const [scoreToAdd, setScoreToAdd] = useState<number>(0) // Score gained for the current question
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
        if (streak > maxStreak) setMaxStreak(streak)
    }, [streak])

    useEffect(() => {
        setHideQuestion(curr => showInfoModal)
    }, [showInfoModal])

    function wrongAnswerToast(triesLeft: number) {
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
        [0, showRoundOverModal ? 0.1 : 0.1]
    )

    return (
        <>
             {props.theme === "Train" ? (
                <QuestionTrainBackground />
            ) : (
                <QuestionBoatBackground />
            )}
            <div className="game-container">
                <div className="game-left-container">
                    <TimeBar roundDuration={props.roundDuration}></TimeBar>
                    <Question 
                        hideQuestion={hideQuestion}
                        theme={props.theme}
                    />  
                </div>
                 <div className="game-right-container">
                    <TeamStats buttonTopOffset={racePathSizing.height + racePathSizing.offsetY * 0.2} playerScore={score}></TeamStats>
                    <div className="coloration-information-element">
                        <ColorationInfo></ColorationInfo>
                    </div>
                 </div>
            </div>
                   
            <InfoModal
                endInfoModal={() => setShowInfoModal(false)}
                showInfoModal={showInfoModal}
                setShowInfoModal={setShowInfoModal}
                modalAnimation={modalAnimation}
                modalText={modalText}
                type={modalType}
                correctAnswer={modalAnswer}
                streak={streak}
                scoreToAdd={scoreToAdd}
                questionType={questionData.iQuestion.type}
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
            <RacePathContext.Provider value={racePath}>
                <div className="race-minimap-container">
                    <div className="race-status-container"  style={{
                        width: racePathSizing.width,
                        height: racePathSizing.height,
                        marginLeft: racePathSizing.offsetX,
                        marginTop: racePathSizing.offsetY
                    }}>
                        <RaceStatus keepClosed={true} roundDuration={props.roundDuration}/>
                    </div>
                    <svg className="minimap-svg-path" style={{
                        width: racePathSizing.width,
                        height: racePathSizing.height,
                        marginLeft: racePathSizing.offsetX,
                        marginTop: racePathSizing.offsetY
                    }}>
                            <path
                                d={racePath.svgPath}
                                fill={"none"}
                                strokeWidth={10}
                                stroke={"#f8b600a2"}
                            />
                    </svg>
                </div>
            </RacePathContext.Provider>
        </>
    )
}

export default Game