import React, { useContext, useEffect, useState } from "react"
import "./DifficultySelection.css"
import {
    useTransition,
    useSpring,
    useChain,
    config,
    animated,
    useSpringRef,
} from "@react-spring/web"
import DifficultyCard from "./DifficultyCard"
import { StreakContext } from "../../../contexts/StreakContext"
import { Streak } from "../../RaceThemes/SharedUtils"
import { DifficultyAvailability, DifficultyAvailabilityContext } from "../../../contexts/DifficultyAvailabilityContext"
import { BoostPowerUpContext } from "../../../contexts/PowerUps/BoostPowerUpContext"
import { defaultBoostFunction, applyBoostToScore, getHelpingHandMultiplier } from "../../Game/PowerUps/PowerUpFunctions"
import { HelpingHandPowerUpContext } from "../../../contexts/PowerUps/HelpingHandPowerUpContext"

/**
 * @interface CardInfo - interface used due to the animations, has info related to the difficulty card
 * @field difficulty: string - difficulty to be displayed on the card
 * @field emoji: string - emoji to be displayed on the card
 */
interface CardInfo {
    difficulty: string
    emoji: string
    basePoints: number
    points: number
    attempts: string
}

interface Props {
    open: boolean
    showDescription: boolean
    type: string
    onDifficultySelected: () => void
    easyIsOnCooldown: boolean
}

/**
 * Component that displays the difficulty selection modal
 */
export default function DifficultySelection(props: Props) {
    const powerUps = useContext(BoostPowerUpContext)
    const streaks = useContext(StreakContext)    
    const helpingHandContext = useContext(HelpingHandPowerUpContext)
    const difficultyAvailability = useContext(DifficultyAvailabilityContext)    
    const [showFlameAnimation, setShowFlameAnimation] = useState<boolean>(false)

    const updateFlameAnimationStatus = () => {
        if (props.open) {
            setShowFlameAnimation(curr => true)
        }
        
        else setShowFlameAnimation(curr => false)
    }

    // Animation for the modal to appear
    const springApi = useSpringRef()
    const { size, ...rest } = useSpring({
        ref: springApi,
        config: config.stiff,
        from: {
            opacity: 0,
            size: "0%",
            pointerEvent: "none",
        },
        to: {
            opacity: props.open ? 1 : 0,
            size: props.open ? "95%" : "0%",
            pointerEvent: props.open ? "all" : "none",
        },
        onRest: updateFlameAnimationStatus
    })

    // Animation for the text to appear
    const modalText = [
        "Choose the difficulty for your next question",
        "You finished all the mandatory questions! You can now select the difficulty for each of your next questions. The harder the question, the more time it takes; however, it offers more points."
    ]

    const getTextElements = () => {
        if (props.showDescription) 
            return [
                "Choose the difficulty for your next question",
                "You finished all the mandatory questions! You can now select the difficulty for each of your next questions. The harder the question, the more time it takes; however, it offers more points."
            ]
        else
            return [
                "Choose the difficulty for your next question"
            ]
    }

    const textAnimationApi = useSpringRef()
    const textAnimation = useSpring({
        ref: textAnimationApi,
        from: { opacity: props.open ? 0 : 1, scale: props.open ? 0 : 1 },
        to: { opacity: props.open ? 1 : 0, scale: props.open ? 1 : 0 },
    })

    // Animation for the difficulty cards to appear
    const cardInfo: CardInfo[] = [
        {
            difficulty: "Easy",
            emoji: "😃",
            basePoints: 10,
            points: 10,
            attempts: "Tries: 1",
        },
        {
            difficulty: "Medium",
            emoji: "😐",
            basePoints: 50,
            points: 50,
            attempts: "Tries: 2",
        },
        {
            difficulty: "Hard",
            emoji: "😈",
            basePoints: 150,
            points: 150,
            attempts: "Tries: 3",
        },
    ]
    const transApiCard = useSpringRef()
    // const transitionCard = useTransition(props.open ? cardInfo : [], {
    //     ref: transApiCard,
    //     trail: 100,
    //     from: { opacity: 0, scale: 0, PointerEvent: "none" },
    //     enter: { opacity: 1, scale: 1, PointerEvent: "all" },
    //     leave: { opacity: 0, scale: 0, PointerEvent: "none" },
    // })

    const cardAnimation = useSpring({
        ref: transApiCard,
        from: { opacity: props.open ? 0 : 1 },
        to: { opacity: props.open ? 1 : 0 },
      }) 

    useChain(
        props.open
            ? [springApi, textAnimationApi, transApiCard]
            : [transApiCard, textAnimationApi, springApi],
        [0, 0.1, 0.2]
    )

    const [easyCounter, setEasyCounter] = useState(0)
    const [disableDifficultyButtons, setDisableDifficultyButtons] = useState<DifficultyAvailability>({
        easy: false,
        medium: false,
        hard: false
    })

    const handleEasyCardClick = () => {
        setEasyCounter((prevCounter) => prevCounter + 1)
    }

    const getStreakForDifficulty = (difficulty: string) => {
        const streak: Streak | undefined = streaks.find(x => x.questionType == difficulty.toLowerCase())

        if (streak)
            return streak
        else 
            return {
                questionType: "",
                streakValue: 0,
                streakMultiplier: 1
            }
    }

    useEffect(() => {
        setDisableDifficultyButtons(curr => ({
            easy: !difficultyAvailability.easy,
            medium: !difficultyAvailability.medium,
            hard: !difficultyAvailability.hard,
        }));
    }, [difficultyAvailability]);

    const updateDifficultyButtonStatus = (index: number, status: boolean) => {
        const statuses = {...disableDifficultyButtons}

        switch(index) {
            case 0:
                statuses.easy = status
                break

            case 1:
                statuses.medium = status
                break

            case 2:
                statuses.hard = status
                break

            default:
                break
        }

        setDisableDifficultyButtons(curr => ({ ...statuses }));
    }

    const getDifficultyStatus = (index: number) => {
        switch(index) {
            case 0:
                return disableDifficultyButtons.easy

            case 1:
                return disableDifficultyButtons.medium

            case 2:
                return disableDifficultyButtons.hard

            default:
                return disableDifficultyButtons.easy
        }

    }

    const calculateTotalPoints = (item: CardInfo) => {
        const streakPoints = item.points * getStreakForDifficulty(item.difficulty).streakMultiplier
        
        var powerUpPoints = applyBoostToScore(powerUps.boost.id, streakPoints, getStreakForDifficulty(item.difficulty).streakValue)

        if (helpingHandContext.helpingHandReceived) {
            const multiplier = getHelpingHandMultiplier()
            powerUpPoints = powerUpPoints * multiplier
        }
        
        return powerUpPoints
    }

    return (
        <>
            <div
                className="diff-modal-wrapper"
                style={{ pointerEvents: props.open ? "all" : "none" }}
            >
                <animated.div
                    className="diff-modal"
                    style={{ ...rest, width: size }}
                >
                    {getTextElements().map((item, index) => (
                        <animated.div
                            className={`diff-modal-text${index}`}
                            style={textAnimation}
                            key={index}
                        >
                            {item}
                        </animated.div>
                    ))}
                    <div className="card-grid">
                        {cardInfo.map((item, index) => (
                            <animated.div
                                className={`card-container`}
                                style={cardAnimation}
                                key={index}
                            >
                                <DifficultyCard
                                    difficulty={item.difficulty}
                                    emoji={item.emoji}
                                    basePoints={item.basePoints}
                                    totalPoints={calculateTotalPoints(item)}
                                    attempts={item.attempts}
                                    streak={getStreakForDifficulty(item.difficulty)}
                                    onDifficultySelected={props.onDifficultySelected}
                                    setEasyCounter={setEasyCounter}
                                    onEasyCardClick={handleEasyCardClick}
                                    disableButton={getDifficultyStatus(index)}
                                    showFlame={showFlameAnimation}
                                    isOnCooldown={item.difficulty.toLowerCase() === "easy" ? props.easyIsOnCooldown : false}
                                ></DifficultyCard>
                            </animated.div>
                        ))}
                    </div>
                </animated.div>
            </div>
        </>
    )
}
