import React, { useState } from "react"
import "./SelectName.css"

interface Props {
    teamNameSelected: (name: string) => void
    onStepCompleted: () => void
}

function SelectName(props: Props) {
    const [name, setName] = useState("New Team")

    const nameChangeHandler = (newName: string) => {
        setName((curr) => newName)
    }

    const completeStep = () => {
        props.teamNameSelected(name)
        props.onStepCompleted()
    }

    return (
        <div>
            <input
                type="text"
                className="team-name-input"
                placeholder="New Team"
                onChange={(e) => nameChangeHandler(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key == "Enter") completeStep()
                }}
            />
            <button
                type="button"
                className="team-name-btn"
                onClick={() => completeStep()}
            >
                Select
            </button>
        </div>
    )
}

export default SelectName
