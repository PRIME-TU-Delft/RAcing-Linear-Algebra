import { send } from "process"
import React, { useEffect, useState } from "react"
import Card from "react-bootstrap/Card"
import socket from "../../../socket"

interface Props {
    difficulty: string
    emoji: string
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    points: string
    attempts: string
    setEasyCounter: React.Dispatch<React.SetStateAction<number>>
    onEasyCardClick: () => void
    disableButton: boolean
}
/**
 * DifficultyCard component that will displyed in the select difficulty modal.
 * This contains the difficulty and the emoji for that difficulty
 */
export default function DifficultyCard(props: Props) {
    function sendDifficulty() {
        props.setOpen((open) => !open)
        socket.emit("getNewQuestion", props.difficulty.toLowerCase())
        if (props.difficulty === "Easy") {
            props.onEasyCardClick() // Call the click handler only for "Easy" DifficultyCard
        }
    }

    return (
        <>
            <div className="card-flexbox">
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
                        <Card.Text className="emoji">{props.emoji}</Card.Text>
                    </Card.Body>
                </Card>
                {props.disableButton && props.difficulty === "Easy" && (
                    <p className="optional-text-diff">
                        You have to select a different difficulty
                    </p>
                )}
                <p className="card-points">{props.points}</p>
                <p className="card-attempts">{props.attempts}</p>
            </div>
        </>
    )
}
