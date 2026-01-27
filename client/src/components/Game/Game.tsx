import React, { useContext, useEffect, useMemo, useState } from "react";
import { Bounce, Flip, ToastContainer, Zoom, toast } from "react-toastify";
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
import { Checkpoint, RacePathObject } from "../RaceThemes/SharedUtils";
import { RaceDataContext } from "../../contexts/RaceDataContext";
import useWindowDimensions from "../RaceThemes/Tracks/WindowDimensions";
import RaceStatus from "../RaceThemes/RaceStatus/RaceStatus";
import { RacePathContext } from "../../contexts/RacePathContext";
import Tracks from "../RaceThemes/Tracks/Tracks";
import { getMinimapPathColorForTheme, getRacePathSizeAndOffsetMargins } from "./GameService";
import { QuestionContext } from "../../contexts/QuestionContext";
import ColorationInfo from "../ColorationInfo/ColorationInfo";
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import 'animate.css';
import { GraspleQuestionContext } from "../../contexts/GraspleQuestionContext";
import { QuestionStatusContext } from "../../contexts/QuestionStatusContext";
import CheckpointNotification from "./CheckpointNotification/CheckpointNotification";

interface Props {
    theme: string
    roundDuration: number
    roundStarted: boolean
    playerScoreBeforeReconnecting: number
    isFirstRound: boolean
    onRoundEnded: () => void
    onUpdatePlayerScore: (score: number) => void
}

interface Statistic {
    question: string
    answer: string
    difficulty: string
    correctlyAnswered: number
    incorrectlyAnswered: number
}

function Game(props: Props) {
    const raceData = useContext(RaceDataContext)
    const questionData = useContext(QuestionContext)
    const graspleQuestionData = useContext(GraspleQuestionContext)
    const [currentNumberOfAttempts, setCurrentNumberOfAttempts] = useState<number>(0)
    const [updatedNumberOfAttempts, setUpdatedNumberOfAttempts] = useState<boolean>(false);

    const [questionStarted, setQuestionStarted] = useState<boolean>(false)
    const [questionFinished, setQuestionFinished] = useState<boolean>(false)

    const [showPopup, setShowPopup] = useState(false)

    const [countdown, setCountdown] = useState(-1)
    const [checkpointPassed, setCheckpointPassed] = useState<Checkpoint | null>(null)

    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    
      useEffect(() => {
        const handleResize = () => {
          setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        };
    
        window.addEventListener("resize", handleResize);
        
        return () => window.removeEventListener("resize", handleResize);
      }, []);

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
    //FIXME: UNCOMMENT THIS LINE, COMMENTED FOR TESTING
    // window.addEventListener("load", () => navigate("/"))

    window.onmessage = function(e) {
        if (e.data.v === "0.0.2" && e.data.namespace === "standalone" && e.data.event === "checked_answer") {
            if (!updatedNumberOfAttempts) {
                setNumberOfAttempts(e.data.properties.max_attempts)
            }
            
            if (e.data.properties.correct) {
                socket.emit("questionAnswered", true, graspleQuestionData.questionData.difficulty.toLowerCase())
            } else if (updatedNumberOfAttempts) {
                onQuestionAnsweredIncorrectly(currentNumberOfAttempts - 1)
            } else {
                onQuestionAnsweredIncorrectly(e.data.properties.max_attempts - 1)
            }
        }
    };

    const racePathSizing = getRacePathSizeAndOffsetMargins(dimensions.width, dimensions.height)
    const racePath: RacePathObject = useMemo(() => getRacePathObject(raceData.selectedMap, racePathSizing.width, racePathSizing.height), [raceData.selectedMap, dimensions.height, dimensions.width]) // multiple maps may be used in the future, currently only one exists


    socket.emit("getMandatoryNum")

    function show_notification() {
        Store.addNotification({
            title: "Color Coding",
            message: "Click this information button to learn about the game's color coding!",
            type: "default",
            insert: "bottom",
            container: "bottom-right",
            animationIn: ["animate__animated", "animate__jackInTheBox"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
              duration: 10000,
              onScreen: true
            }
        });
    }

    /**
     * Applies the logic for detecting spam answering of an easy question.
     *  - if the question was answered correctly, reset incorrect streak and decrement the spam counter by 2
     *  - if it was increased incorrectly, but the player hasn't spammed twice in a row, 
     *    decrement both the spam counter and the incorrect streak
     *  - otherwise, simply continue the incorrect streak
     * @param answeredCorrectly 
     */
    function easyQuestionAnswered(answeredCorrectly: boolean) {
        if (answeredCorrectly) {
            setIncorrectAnswerStreak(curr => 0)
            setSpamAnswerCounter(curr => Math.max(curr - 2, 0))
        } else if (nonSpamAnswerCounter >= 2) {
            setSpamAnswerCounter(curr => Math.max(curr - 1, 0))
            setIncorrectAnswerStreak(curr => Math.max(curr - 1, 0))
        } else {
            setIncorrectAnswerStreak(curr => curr + 1)
        }
    }

    function onQuestionAnsweredCorrectly(score: number) {
        // What happens if the answer is correct
        // setModalText(["✔️ Your answer is correct!"])
        // setModalType("correctAnswer")
        setScoreToAdd((cur) => score)
        setRightAnswers((rightAnswers) => rightAnswers + 1)
        setStreak((streak) => streak + 1)
        // setShowInfoModal(true)
        correctAnswerToast()

        if (graspleQuestionData.questionData.difficulty.toLowerCase() === "easy")
            easyQuestionAnswered(true)

        if (graspleQuestionData.questionNumber < graspleQuestionData.numberOfMandatory) {
            socket.emit("getNewQuestion")
        }
    }

    function onQuestionAnsweredIncorrectly(triesLeft: number) {
        setModalText([
            "Your answer is incorrect! The correct answer is:",
        ])

        if (triesLeft === 0) {
            // setModalType("incorrectAnswer")
            // setModalAnswer("")
            setStreak(0)
            setScoreToAdd(0)
            setWrongAnswers((wrongAnswers) => wrongAnswers + 1)
            // setShowInfoModal(true)
            setQuestionFinished(curr => true)
            incorrectAnswerToast()
        } else {
            wrongAnswerToast(triesLeft)
            setCurrentNumberOfAttempts(curr => Math.max(0, curr - 1))
        }
    }

    // Function meant for when the player uses all attempts and answers incorrectly
    // Instead of immediately moving to the next question, they need to request it with a button
    // This gives them time to review their mistake if necessary
    const onPlayerReadyForNewQuestion = () => {
        setQuestionFinished(curr => false)

        if (graspleQuestionData.questionData.difficulty.toLowerCase() === "easy")
            easyQuestionAnswered(false)
        socket.emit("questionAnswered", false, graspleQuestionData.questionData.difficulty.toLowerCase())
        
        if (graspleQuestionData.questionNumber < graspleQuestionData.numberOfMandatory) {
            socket.emit("getNewQuestion")
        }
    }

    useEffect(() => {
        setUpdatedNumberOfAttempts(curr => false)
        setQuestionFinished(curr => false)
        setQuestionStarted(true)
    }, [graspleQuestionData.questionNumber])

    useEffect(() => {
        console.log(props.playerScoreBeforeReconnecting)
        console.log(score)
        if (props.playerScoreBeforeReconnecting > score) {
            setScore(props.playerScoreBeforeReconnecting)
        }
    }, [props.playerScoreBeforeReconnecting])

    useEffect(() => {
        // Question started is just used as a signal for the question overlay nodes to update
        if (questionStarted) {
            setQuestionStarted(curr => false)
        }
    }, [questionStarted])

    const setNumberOfAttempts = (newNumberOfAttemtps: number) => {
        setCurrentNumberOfAttempts(curr => newNumberOfAttemtps);
        setUpdatedNumberOfAttempts(curr => true)
    }

    useEffect(() => {
        console.log(currentNumberOfAttempts)
    }, [currentNumberOfAttempts])

    useEffect(() => {
        setShowInfoModal(false)
        if (props.playerScoreBeforeReconnecting == 0) {
            setScore(0)
        } 
        setRightAnswers(0)
        setWrongAnswers(0)
        setStreak(0)
        setMaxStreak(0)
        setShowRoundOverModal(false)
        setShowPopup(true)
        setCountdown(3)

        // Only show the color coding information notification at the start of the first round
        if (props.isFirstRound)
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
            setScoreToAdd(score)
            onQuestionAnsweredCorrectly(score)
        })

        socket.off("wrongAnswer").on("wrongAnswer", (triesLeft: number) => {
            // What happens if the answer is incorrect and you have no tries left
            onQuestionAnsweredIncorrectly(triesLeft)
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

    // Spam detection for easy questions
    const [spamAnswerCounter, setSpamAnswerCounter] = useState<number>(0)
    const [incorrectAnswerStreak, setIncorrectAnswerStreak] = useState<number>(0)
    const [easyQuestionsOnCooldown, setEasyQuestionsOnCooldown] = useState<boolean>(false)
    const [nonSpamAnswerCounter, setNonSpamAnswerCounter] = useState<number>(0)

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

    useEffect(() => {
        props.onUpdatePlayerScore(score)
    }, [score])

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

    function correctAnswerToast() {
        toast.success('✔️ Your answer is correct!', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Flip,
            style: {
                fontSize: '20px',
                minWidth: '400px',
                marginTop: '4rem'
              }
            });
    }

    function incorrectAnswerToast() {
        toast.error('❌ Your answer is incorrect!', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Flip,
            style: {
                fontSize: '20px',
                minWidth: '400px',
                marginTop: '4rem'
              }
            });
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

    /**
     * Calculates the player response time, and keeps track of internal spam counter, to prevent spam answering of easy questions
     * This is because easy questions are dominated by MCQ and True/False questions, which can be spam answered to amass points
     * by chance (since the player will select a correct answer eventually by chance)
     * 
     * @param answerTime    the time at which the player submitted the answer
     */
    function calculateResponseTime(questionStartTime: number, answerTime: number) {
        // Spam checking only for easy questions
        if (questionData.iQuestion.difficulty.toLowerCase() !== "easy") return

        const responseTime = (answerTime - questionStartTime) / 1000

        const baseSpamAnswerTimeThreshold = 2
        const spamAnswerTimeIncrement = 1

        if (responseTime < baseSpamAnswerTimeThreshold + incorrectAnswerStreak * spamAnswerTimeIncrement) {
            setSpamAnswerCounter(curr => curr + 1)
            setNonSpamAnswerCounter(curr => 0)
        } 
        else {
            setNonSpamAnswerCounter(curr => curr + 1)
        }
    }

    const getEmojiForDifficulty = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "easy":
                return "😃"

            case "medium":
                return "😐"
            
            case "hard":
                return "😈"
            
            default:
                return "❓"
        }
    }

    useEffect(() => {
        if (spamAnswerCounter >= 3) {
            setEasyQuestionsOnCooldown(curr => true)
            setSpamAnswerCounter(curr => 0)
            setIncorrectAnswerStreak(curr => 0)

            setTimeout(() => {
                setEasyQuestionsOnCooldown(curr => false)
            }, 30000);
        }
    }, [spamAnswerCounter])

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

    const checkpointPassedHandler = (checkpoint: Checkpoint) => {
        console.log("Checkpoint passed: " + checkpoint.name)
        setCheckpointPassed(checkpoint)
    }

    const modalAnimationRef = useSpringRef()
    const modalAnimation = useSpring({
        ref: modalAnimationRef,
        config: config.stiff,
        from: {
            scale: 0,
            opacity: 0,
            size: "0%",
        },
        to: {
            scale: showInfoModal ? 1 : 0,
            opacity: showInfoModal ? 1 : 0,
            size: showInfoModal ? "100%" : "0%",
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
                    <QuestionStatusContext.Provider value={{questionStarted, questionFinished, remainingAttempts: currentNumberOfAttempts, newQuestionEvent: onPlayerReadyForNewQuestion}}>
                        <Question 
                                hideQuestion={hideQuestion}
                                theme={props.theme}
                                infoModalDisplayed={showInfoModal}
                                calculateResponseTime={calculateResponseTime}
                                easyQuestionsOnCooldown={easyQuestionsOnCooldown}
                                difficultyName={graspleQuestionData.questionData.difficulty}
                                difficultyEmoji={getEmojiForDifficulty(graspleQuestionData.questionData.difficulty)}
                                pointsToGain={graspleQuestionData.pointsToGain}
                            />  
                    </QuestionStatusContext.Provider>    
                </div>
                 <div className="game-right-container">
                    {checkpointPassed && <CheckpointNotification checkpointName={checkpointPassed.name} />}
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
                        <RaceStatus keepClosed={true} roundDuration={props.roundDuration} onCheckpointPassed={checkpointPassedHandler}/>
                    </div>
                    <svg 
                        className="minimap-svg-path"
                        viewBox={raceData.theme == 'Boat' ? `0 0 1920 1080`: ''}
                        preserveAspectRatio={raceData.theme == 'Boat' ? "xMidYMid meet" : ''}
                        style={{
                            width: racePathSizing.width,
                            height: racePathSizing.height,
                            marginLeft: racePathSizing.offsetX,
                            marginTop: racePathSizing.offsetY,
                        }}

                    >
                        <path
                            d={racePath.svgPath}
                            fill={"none"}
                            strokeWidth={10}
                            stroke={getMinimapPathColorForTheme(raceData.theme)}
                            vectorEffect="non-scaling-stroke" 
                        />
                    </svg>
                </div>
            </RacePathContext.Provider>
        </>
    )
}

export default Game