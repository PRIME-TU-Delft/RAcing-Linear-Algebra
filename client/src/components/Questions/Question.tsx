import React, { useContext, useEffect, useRef, useState } from "react"
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
import { QuestionContext } from "../../contexts/QuestionContext"
import { GraspleQuestionContext } from "../../contexts/GraspleQuestionContext"
import QuestionOverlayBox from "./QuestionOverlayBox"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faQuestion } from "@fortawesome/free-solid-svg-icons"
import { QuestionStatusContext } from "../../contexts/QuestionStatusContext"
import { ChoosingDifficultyContext } from "../../contexts/ChoosingDifficultyContext"

interface Props {
    hideQuestion: boolean,
    theme: string,
    infoModalDisplayed: boolean,
    calculateResponseTime: (startTime: number, endTime: number) => void,
    easyQuestionsOnCooldown: boolean
    pointsToGain: number
    difficultyEmoji: string
    difficultyName: string
}

function Question(props: Props) {
    const questionData = useContext(QuestionContext)
    const graspleQuestionData = useContext(GraspleQuestionContext)
    const questionStatusContext = useContext(QuestionStatusContext)
    const {choosingDifficulty, setChoosingDifficulty} = useContext(ChoosingDifficultyContext)

    const [showPopup, setShowPopup] = useState(false)

    const [countdown, setCountdown] = useState(-1)
    const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showDifficultySelectionDescription, setShowDifficultySelectionDescription] = useState(true)

    const [hasToSelectDifficulty, setHasToSelectDifficulty] = useState(false)
    // Variable to display the difficulty selection screen
    const [showDifficulty, setShowDifficulty] = useState<boolean>(false)
    // Variable to display the info modal
    const [showInfoModal, setShowInfoModal] = useState<boolean>(false)
    // Varaible to display the round over modal
    const [showRoundOverModal, setShowRoundOverModal] = useState<boolean>(false)
    // This will be used to disable the submit button for a short period of time when the user submits an answer
    const [disableButton, setDisableButton] = useState<boolean>(false)
    
    const [questionStartTime, setQuestionStartTime] = useState<number>(0)
    const [skipQuestionAvailable, setSkipQuestionAvailable] = useState<boolean>(false)
    const showDifficultyRef = useRef<boolean>(showDifficulty); // Ref to track the latest value of showDifficulty


    useEffect(() => {
        showDifficultyRef.current = showDifficulty;
    }, [showDifficulty]);

    // All the socket events for the questions are handled here
    useEffect(() => {
        if (choosingDifficulty) {
            setDisableButton(true)
            setHasToSelectDifficulty(true)
            setChoosingDifficulty(false)
        }
    }, [choosingDifficulty])

    useEffect(() => {
        if (hasToSelectDifficulty && !props.infoModalDisplayed) {
            setHasToSelectDifficulty(false)
            setShowDifficulty(true)
            setDisableButton(false)
        }
    }, [props.infoModalDisplayed, hasToSelectDifficulty])

    useEffect(() => {
        setSkipQuestionAvailable(false);
        if (graspleQuestionData.questionNumber < graspleQuestionData.numberOfMandatory) return;

        if (skipTimeoutRef.current) {
            clearTimeout(skipTimeoutRef.current);
        }

        skipTimeoutRef.current = setTimeout(() => {

            if (!showDifficultyRef.current) {
                setSkipQuestionAvailable(true);
            }
        }, 20000);

        return () => {
            if (skipTimeoutRef.current) {
                clearTimeout(skipTimeoutRef.current);
            }
        };
    }, [questionStartTime]);

    const nextQuestionHandler = () => {
        setSkipQuestionAvailable(false)
        questionStatusContext.newQuestionEvent()
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

    const difficultySelectedHandler = () => {
        setShowDifficulty(curr => false)
        setShowDifficultySelectionDescription(curr => false)
        setQuestionStartTime(Date.now())
    }

    const overlayContent1 = (<div>HELLO</div>)
    const overlayContent2 = (<div>
        <FontAwesomeIcon icon={faQuestion} />
    </div>)

    return (
           <animated.div
                className="question-container"
                style={bodyAnimation}
                data-testid="question-container"
            >
                <DifficultySelection
                    open={showDifficulty}
                    showDescription={showDifficultySelectionDescription}
                    onDifficultySelected={difficultySelectedHandler}
                    type={questionData.iQuestion.subject}
                    easyIsOnCooldown={props.easyQuestionsOnCooldown}
                ></DifficultySelection>

                <QuestionOverlayBox 
                    margin={60} 
                    openOnStart={false} 
                    closedText= {`${graspleQuestionData.questionNumber}`}
                    openText={`Question ${graspleQuestionData.questionNumber}`}
                    show={!questionStatusContext.questionFinished && !showDifficulty}
                    openOnHover={true}
                    startOpenDelay={3}/>

                <QuestionOverlayBox 
                    margin={140} 
                    openOnStart={false} 
                    closedText= {`${props.difficultyEmoji}`}
                    color="#0063D3"
                    openText={`${String(props.difficultyName).charAt(0).toUpperCase() + String(props.difficultyName).slice(1)} ${props.difficultyEmoji}`}
                    show={!questionStatusContext.questionFinished && !showDifficulty}
                    openOnHover={true}
                    startOpenDelay={3}/>

                <QuestionOverlayBox 
                    margin={220} 
                    closedText= {`${props.pointsToGain}`}
                    color="#0063D3"
                    openText={`Points ${props.pointsToGain}`}
                    show={!questionStatusContext.questionFinished && !showDifficulty}
                    openOnHover={true}
                    startOpenDelay={3}/>

                <QuestionOverlayBox 
                    isAction={true} 
                    margin={80} 
                    closedText=">>"
                    openText="Next question" 
                    color="#198754"
                    staysOpen={questionStatusContext.questionFinished} 
                    openOnStart={questionStatusContext.questionFinished}
                    show={(questionStatusContext.questionFinished || skipQuestionAvailable) && !showDifficulty}
                    openOnHover={true}
                    startOpenDelay={2}
                    onBoxClicked={nextQuestionHandler}
                    />

                {!showDifficulty && !disableButton && !props.hideQuestion ? 
                    <div style={{height: "100%"}}>
                        <iframe height="100%" src={graspleQuestionData.questionData.url} title={graspleQuestionData.questionData.name} width="80%" allow="clipboard-read; clipboard-write"></iframe>
                    </div>
                    // <div>
                    //     {questionData.iQuestion !== null && (
                    //         <>
                    //             {questionData.iQuestion.type === "open" ||
                    //             questionData.iQuestion.type === "open-infinite" ? (
                    //                 <OpenQuestion
                    //                     latex={questionData.iQuestion.question}
                    //                     questionNum={questionData.questionNumber}
                    //                     disableButton={disableButton}
                    //                     theme={props.theme}
                    //                     questionDifficulty={questionData.iQuestion.difficulty}
                    //                     onAnswerSubmitted={(answerTime: number) => props.calculateResponseTime(questionStartTime, answerTime)}
                    //                 />
                    //             ) : questionData.iQuestion.type === "mc" ? (
                    //                 <MultipleChoice
                    //                     latex={questionData.iQuestion.question}
                    //                     answers={questionData.iQuestion.options ? questionData.iQuestion.options : []}
                    //                     questionNum={questionData.questionNumber}
                    //                     disableButton={disableButton}
                    //                     theme={props.theme}
                    //                     questionDifficulty={questionData.iQuestion.difficulty}
                    //                     onAnswerSubmitted={(answerTime: number) => props.calculateResponseTime(questionStartTime, answerTime)}
                    //                 />
                    //             ) : questionData.iQuestion.type === "true/false" ? (
                    //                 <TrueFalseQuestion
                    //                     latex={questionData.iQuestion.question}
                    //                     questionNum={questionData.questionNumber}
                    //                     disableButton={disableButton}
                    //                     theme={props.theme}
                    //                     questionDifficulty={questionData.iQuestion.difficulty}
                    //                     onAnswerSubmitted={(answerTime: number) => props.calculateResponseTime(questionStartTime, answerTime)}
                    //                 />
                    //             ) : null}
                    //         </>
                    //     )}
                    // </div> 
                : null}
            </animated.div>
    )
}

export default Question
