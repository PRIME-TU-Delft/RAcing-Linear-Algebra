import { send } from "process"
import React, { useEffect, useState } from "react"
import Card from "react-bootstrap/Card"
import socket from "../../../socket"
import { Streak } from "../../RaceThemes/SharedUtils"
import FlameAnimation from "../Streak/Flame/Flame"
import CardCooldownGraphic from "./CardCooldownGraphic/CardCooldownGraphic"
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'

import EasyIcon from "../../../img/icons/train-easy.png"
import MediumIcon from "../../../img/icons/train-medium.png"
import HardIcon from "../../../img/icons/train-hard.png"

interface Props {
    difficulty: string
    emoji: string
    onDifficultySelected: () => void
    pointsText: string
    totalPoints: number
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
export default function  DifficultyCard(props: Props) {
    const [showStreak, setShowStreak] = useState<boolean>(false)
    const [difficultyCleared, setDifficultyCleared] = useState<boolean>(false)

    useEffect(() => {
        if (props.disableButton && !props.isOnCooldown )
            setTimeout(() => {
                setDifficultyCleared(curr => true)
            }, 500);
        else
            setDifficultyCleared(curr => false)
    }, [props.disableButton, props.isOnCooldown])

    useEffect(() => {
        if (props.streak.streakValue > 0)
            setShowStreak(curr => true)
        else
            setShowStreak(curr => false)
    }, [props.streak])

    function sendDifficulty() {
        if (props.disableButton) return

        props.onDifficultySelected()
        socket.emit("getNewQuestion", props.difficulty.toLowerCase())
        if (props.difficulty === "Easy") {
            props.onEasyCardClick() // Call the click handler only for "Easy" DifficultyCard
        }
    }

    const getSpriteForDifficulty = (difficulty: string) => {
        switch(difficulty) {
            case "Easy":
                return EasyIcon
            case "Medium":
                return MediumIcon
            case "Hard":
                return HardIcon
            default:
                return EasyIcon
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
                            className={props.disableButton ? "difficulty-card-disabled" : ""}
                            onClick={sendDifficulty}
                        >
                            <Card.Title className="card-title">
                                {props.difficulty}
                            </Card.Title>
                            <Card.Text className="emoji"> 
                                {difficultyCleared ? 
                                (<div>
                                    👑
                                </div>) 
                                : (<div className="card-icon">
                                    <img src={getSpriteForDifficulty(props.difficulty)} alt={`${props.difficulty} icon`} />
                                </div>)}
                            </Card.Text>
                            <Card.Text>
                                {difficultyCleared ? 
                                    (<div className="row justify-content-center card-points-text">
                                        CLEARED!
                                    </div>)
                                    : (
                                    <div className="row justify-content-center card-points-text">
                                        {Math.floor(props.totalPoints)}
                                    </div>)
                                }
                                        
                                        {showStreak && !difficultyCleared ? (
                                            <div className="container">
                                                <div className="row justify-content-center card-streak">
                                                    <div className="ms-2 col d-flex justify-content-center">
                                                        <div className="d-flex justify-content-center align-items-center">
                                                            <b>{props.streak.streakValue}</b>
                                                        </div>
                                                        <FlameAnimation showAnimation={props.showFlame}></FlameAnimation>
                                                    </div>
                                                </div>
                                                

                                            </div>
                                        
                                    ) : null}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                )}
                <Tooltip 
                     id="cooldown-tooltip" 
                     place="right"
                     style={{backgroundColor: "#F0C80F", fontSize: "17px", zIndex: 9999}}
                />
                {difficultyCleared ? (
                    <div className="optional-text-diff">
                        Difficulty cleared. 
                        <br></br>
                        Try another one!
                    </div>
                ) : 
                (<div>
                    <p className="card-points">{props.pointsText}</p>
                    <p className="card-points">
                        Streak multiplier: <b>{props.streak.streakMultiplier}x</b>
                    </p>
                </div>)}
                
            </div>
        </>
    )
}
