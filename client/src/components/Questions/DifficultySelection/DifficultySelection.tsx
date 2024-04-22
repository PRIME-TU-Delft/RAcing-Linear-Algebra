import React, { useEffect, useState } from "react"
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

/**
 * @interface CardInfo - interface used due to the animations, has info related to the difficulty card
 * @field difficulty: string - difficulty to be displayed on the card
 * @field emoji: string - emoji to be displayed on the card
 */
interface CardInfo {
    difficulty: string
    emoji: string
    points: string
    attempts: string
}

interface Props {
    open: boolean
    type: string
    onDifficultySelected: () => void
}
/**
 * Component that displays the difficulty selection modal
 */
export default function DifficultySelection(props: Props) {
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
    })

    // Animation for the text to appear
    const modalText = [
        "Choose the difficulty for your next question",
        "You finished all the mandatory questions! This means that you can now select the difficulty for each of your next questions. The harder a question is the more time it takes, however they also offer more points.",
    ]
    const transApi = useSpringRef()
    const transitionText = useTransition(props.open ? modalText : [], {
        ref: transApi,
        trail: 100,
        from: { opacity: 0, scale: 0 },
        enter: { opacity: 1, scale: 1 },
        leave: { opacity: 0, scale: 0 },
    })

    // Animation for the difficulty cards to appear
    const cardInfo: CardInfo[] = [
        {
            difficulty: "Easy",
            emoji: "😃",
            points: "Base points: 10",
            attempts: "1 attempt",
        },
        {
            difficulty: "Medium",
            emoji: "😐",
            points: "Base points: 50",
            attempts: "2 attempts",
        },
        {
            difficulty: "Hard",
            emoji: "😈",
            points: "Base points: 150",
            attempts: "3 attempts",
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
            ? [springApi, transApi, transApiCard]
            : [transApiCard, transApi, springApi],
        [0, props.open ? 0.3 : 0.6, props.open ? 0.3 : 0.6]
    )
    let i = 0 // used to give each card a unique class name

    const [easyCounter, setEasyCounter] = useState(0)
    const [disableButton, setDisableButton] = useState(false)

    const handleEasyCardClick = () => {
        setEasyCounter((prevCounter) => prevCounter + 1)
    }

    useEffect(() => {
        if (easyCounter === 7 && props.type === "Diagonalization")
            setDisableButton(true)
    }, [easyCounter])

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
                    {transitionText((style, item) => (
                        <animated.div
                            className={`diff-modal-text${i++}`}
                            style={{ ...style }}
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
                                    points={item.points}
                                    attempts={item.attempts}
                                    onDifficultySelected={props.onDifficultySelected}
                                    setEasyCounter={setEasyCounter}
                                    onEasyCardClick={handleEasyCardClick}
                                    disableButton={disableButton}
                                ></DifficultyCard>
                            </animated.div>
                        ))}
                    </div>
                </animated.div>
            </div>
        </>
    )
}
