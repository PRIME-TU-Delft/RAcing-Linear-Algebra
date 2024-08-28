import { send } from "process"
import React, { useEffect, useState } from "react"
import Card from "react-bootstrap/Card"
import socket from "../../../socket"
import { Streak } from "../../RaceThemes/SharedUtils"
import FlameAnimation from "../Streak/Flame/Flame"
import CardCooldownGraphic from "./CardCooldownGraphic/CardCooldownGraphic"
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
interface Props {
    difficulty: string
    emoji: string
    onDifficultySelected: () => void
    points: string
    attempts: string
    streak: Streak
    setEasyCounter: React.Dispatch<React.SetStateAction<number>>
    onEasyCardClick: () => void
    disableButton: boolean
    showFlame: boolean
    isOnCooldown: boolean
}
/**
 * DifficultyCard component that will displyed in the select difficulty modal.
 * This contains the difficulty and the emoji for that difficulty
 */
export default function DifficultyCard(props: Props) {
    const [showStreak, setShowStreak] = useState<boolean>(false)

    useEffect(() => {
        if (props.streak.streakValue > 0)
            setShowStreak(curr => true)
        else
            setShowStreak(curr => false)
    }, [props.streak])

    function sendDifficulty() {
        props.onDifficultySelected()
        socket.emit("getNewQuestion", props.difficulty.toLowerCase())
        if (props.difficulty === "Easy") {
            props.onEasyCardClick() // Call the click handler only for "Easy" DifficultyCard
        }
    }

    return (
        <>
            <div className="card-flexbox">
                {props.isOnCooldown ? (
                    <div
                        data-tooltip-id="cooldown-tooltip" 
                        data-tooltip-html="It seems that you were spam answering questions and the tracks got damaged!<br /> Don't worry, our team is already on the scene and the problem should be resolved shortly.<br /> In the meantime, try out a different difficulty!">
                        <CardCooldownGraphic></CardCooldownGraphic>
                    </div>
                ): (
                    <Card className="difficulty-card">
                        <Card.Body
                            style={{
                                pointerEvents:
                                    props.disableButton &&
                                    props.difficulty === "Easy"
                                        ? "none"
                                        : "auto",
                            }}
                            onClick={sendDifficulty}
                        >
                            <Card.Title className="card-title">
                                {props.difficulty}
                            </Card.Title>
                            <Card.Text className="emoji"> {props.emoji}</Card.Text>
                        </Card.Body>
                    </Card>
                )}
                <Tooltip 
                     id="cooldown-tooltip" 
                     place="right"
                     style={{backgroundColor: "#A4CF37", fontSize: "17px", zIndex: 9999}}
                />
                {props.disableButton && props.difficulty === "Easy" && (
                    <p className="optional-text-diff">
                        You have to select a different difficulty
                    </p>
                )}
                <p className="card-points">{props.points}</p>
                <p className="card-attempts">{props.attempts}</p>
                {showStreak ? (
                    <div className="d-flex justify-content-center align-items-center card-streak">
                        <div>
                            Streak:
                        </div>
                        <div className="ms-2">
                            <b>{props.streak.streakValue}</b>
                        </div>
                        <FlameAnimation showAnimation={props.showFlame}></FlameAnimation>
                        <div className="ms-1">
                            ({props.streak.streakMultiplier}x)
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    )
}
