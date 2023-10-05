import React, { useState } from "react"
import "./Rounds.css"
import Round from "./Round/Round"

interface Props {
    onRoundSelected: (rounds: string[]) => void
    onStepCompleted: (completed: boolean) => void
    availableRounds: string[]
}

function Rounds(props: Props) {
    const [selectedRounds, setSelectedRounds] = useState<string[]>([])

    /**
     * Adds or removes selected topic, based on whether it was already selected or deselected and making sure number of rounds doesnt exceed 3
     * @param topic     // the topic selected
     * @param selected  // boolean for whether the topic was selected or deselected
     * @returns         // return proper class name for the rounds
     */
    const roundSelectionHandler = (topic: string, selected: boolean) => {
        if (selected && selectedRounds.length == 3) {
            alert(
                "You can select a maximum of 3 rounds! You can deselect a round by clicking on it again."
            )
            return ""
        }

        // If a round is newly selected
        else if (selected) {
            selectedRounds.push(topic)

            setSelectedRounds([...selectedRounds])
            props.onRoundSelected(selectedRounds)
            props.onStepCompleted(true)

            return "selected"
        }

        // If a round is being deselected
        else {
            const index = selectedRounds.indexOf(topic)
            selectedRounds.splice(index, 1)

            setSelectedRounds([...selectedRounds])
            props.onRoundSelected(selectedRounds)
            if (selectedRounds.length == 0) props.onStepCompleted(false)

            return ""
        }
    }

    return (
        <div className="rounds-container d-flex flex-wrap">
            {props.availableRounds.map((roundTopic) => (
                <Round
                    key={props.availableRounds.indexOf(roundTopic)}
                    topic={roundTopic}
                    onSelectRound={(topic: string, selected: boolean) =>
                        roundSelectionHandler(topic, selected)
                    }
                ></Round>
            ))}
        </div>
    )
}

export default Rounds
