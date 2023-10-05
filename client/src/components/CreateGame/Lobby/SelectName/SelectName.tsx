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

    return (
        <div>
            <input
                type="text"
                className="team-name-input"
                placeholder="New Team"
                onChange={(e) => nameChangeHandler(e.target.value)}
            />
            <button
                type="button"
                className="team-name-btn"
                onClick={() => {
                    props.teamNameSelected(name)
                    props.onStepCompleted()
                }}
            >
                Select
            </button>
        </div>
    )
}

export default SelectName
