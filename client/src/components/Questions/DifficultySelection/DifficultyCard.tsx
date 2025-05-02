import { send } from "process"
import React, { useContext, useEffect, useState } from "react"
import Card from "react-bootstrap/Card"
import socket from "../../../socket"
import { Streak } from "../../RaceThemes/SharedUtils"
import FlameAnimation from "../Streak/Flame/Flame"
import CardCooldownGraphic from "./CardCooldownGraphic/CardCooldownGraphic"
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { PowerUpContext } from "../../../contexts/PowerUpContext"
import { getBoostMultiplier, getBoostStreakRequirement, isBoostActive } from "../../Game/PowerUps/PowerUpFunctions"
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
    const powerUps = useContext(PowerUpContext)
    
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

    const getBoostActivityText = () => {
        switch (powerUps.boost.id) {
            case 1:
                return getBoostMultiplier(powerUps.boost.id) + "x"
            case 2:
                return (isBoostActive(powerUps.boost.id, props.streak.streakValue) ? getBoostMultiplier(powerUps.boost.id) + "x" : " 1x (" + props.streak.streakValue + "/" + getBoostStreakRequirement(powerUps.boost.id) + ")")
            case 3:
                return (isBoostActive(powerUps.boost.id, props.streak.streakValue) ? getBoostMultiplier(powerUps.boost.id) + "x" : " 1x (" + props.streak.streakValue + "/" + getBoostStreakRequirement(powerUps.boost.id) + ")")
            default:
                return ""
        }
    }

    const getBoostTextColor = () => {
        switch (powerUps.boost.id) {
            case 1:
                return "#00D5FF"
            case 2:
                return "#FF00D9"
            case 3:
                return "#9D00FF"
            default:
                return ""
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
                                : (<div>
                                    {props.emoji}
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
                    <p className="active-boost-points">{powerUps.boost.name}: <b className="active-boost-points" style={{color: getBoostTextColor()}}>{getBoostActivityText()}</b></p>
                </div>)}
                
            </div>
        </>
    )
}
