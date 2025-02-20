import React, { useState } from "react"
import "./Studies.css"

interface Props {
    onSelectStudy: (study: string) => void
    onStepCompleted: () => void
    availableStudies: string[]
}

function Studies(props: Props) {
    const [selectedStudy, setSelectedStudy] = useState("")

    const selectStudyHandler = (study: string) => {
        setSelectedStudy(study)
        props.onSelectStudy(study)
        props.onStepCompleted()
    }

    const studyClassHandler = (study: string) => {
        if (selectedStudy == study) return "study-selected"
        else return ""
    }

    return (
        <div className="studies-container">
            {props.availableStudies.map((study, index) => (
                <div
                    key={index}
                    className={"study-container " + studyClassHandler(study)}
                    onClick={() => selectStudyHandler(study)}
                >
                    <div className="study-title">{study}</div>
                    <div className="checked">&#9989;</div>
                </div>
            ))}
        </div>
    )
}

export default Studies
