import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faExclamationTriangle,
    faCheck,
} from "@fortawesome/free-solid-svg-icons"
import "./StartGame.css"

interface Props {
    completedSteps: boolean[] // boolean list for whether the steps where completed or not
    selectedTheme: string // the theme that was selected
    selectedStudy: string // the study that was selected
    selectedRounds: string[] // the rounds that were selected
    playerNumber: number // number of players in the lobby
    onStartGame: () => void // event to start the game
}

function StartGame(props: Props) {
    // Turns the rounds array to a string representation
    const roundsToString = () => {
        let res = ""

        for (let i = 0; i < props.selectedRounds.length; i++) {
            if (
                props.selectedRounds.length > 1 &&
                i == props.selectedRounds.length - 1
            )
                res += " and "
            else if (i > 0) res += ", "

            res += props.selectedRounds[i]
        }

        return res
    }

    const requiredPlayersNumber = 1  // minimum number of players required to start a game; currently 1

    // Determines class for the start game button, based on whether all necessary steps are completed
    const buttonClassHandler = () => {
        if (
            !props.completedSteps[0] ||
            !props.completedSteps[1] ||
            !props.completedSteps[2]
        )
            return "start-game-btn disabled"
        else return "start-game-btn"
    }

    // Text to display if name is not selected
    const nameIncompleteText = (
        <div className="incomplete">
            <FontAwesomeIcon icon={faExclamationTriangle} /> You have not
            selected a name.
        </div>
    )

    // Text to display if theme is not selected
    const themeIncompleteText = (
        <div className="incomplete">
            <FontAwesomeIcon icon={faExclamationTriangle} /> You have not
            selected a theme.
        </div>
    )

    // Text to display if theme is selected
    const themeCompleteText = (
        <div className="complete">
            <FontAwesomeIcon icon={faCheck} /> Selected theme:{" "}
            {props.selectedTheme}
        </div>
    )

    // Text to display if study is not selected
    const studyIncompleteText = (
        <div className="incomplete">
            <FontAwesomeIcon icon={faExclamationTriangle} /> You have not
            selected a study.
        </div>
    )

    // Text to display if study is selected
    const studyCompleteText = (
        <div className="complete">
            <FontAwesomeIcon icon={faCheck} /> Selected study:{" "}
            {props.selectedStudy.toUpperCase()}
        </div>
    )

    // Text to display if no rounds were selected
    const roundsIncompleteText = (
        <div className="incomplete">
            <FontAwesomeIcon icon={faExclamationTriangle} /> You have not
            selected any rounds.
        </div>
    )

    // Text to display if at least one round was selected
    const roundsCompleteText = (
        <div className="complete">
            <FontAwesomeIcon icon={faCheck} /> Selected rounds:{" "}
            {roundsToString()}
        </div>
    )

    // Text to display if minimum number of players wasn't achieved
    const notEnoughPlayersText = (
        <div className="incomplete">
            <FontAwesomeIcon icon={faExclamationTriangle} /> At least {requiredPlayersNumber} player required to start the game.
        </div>
    )

    return (
        <div className="start-game-container">
            <div className="messages">
                {props.completedSteps[0] ? null : nameIncompleteText}
                {props.completedSteps[1]
                    ? themeCompleteText
                    : themeIncompleteText}
                {props.completedSteps[2]
                    ? studyCompleteText
                    : studyIncompleteText}
                {props.completedSteps[3]
                    ? roundsCompleteText
                    : roundsIncompleteText}
                {props.playerNumber < requiredPlayersNumber 
                    ? notEnoughPlayersText
                    : null}
            </div>

            <button
                className={buttonClassHandler()}
                disabled={
                    !props.completedSteps[0] ||
                    !props.completedSteps[1] ||
                    !props.completedSteps[2] ||
                    !props.completedSteps[3] ||
                    props.playerNumber < requiredPlayersNumber
                }
                onClick={props.onStartGame}
            >
                Start game
            </button>
        </div>
    )
}

export default StartGame
