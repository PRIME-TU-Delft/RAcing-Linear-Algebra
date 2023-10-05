import React, { useState } from "react"
import "./Studies.css"

interface Props {
    onSelectStudy: (study: string) => void
    onStepCompleted: () => void
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
            <div
                className={"study-container " + studyClassHandler("cse")}
                onClick={() => selectStudyHandler("cse")}
            >
                <div className="study-title">
                    Computer Science and Engineering
                </div>
                <div className="checked">&#9989;</div>
            </div>

            {/*<div
                className={"study-container " + studyClassHandler("ae")}
                onClick={() => selectStudyHandler("ae")}
            >
                <div className="study-title">Aerospace Engineering</div>
                <div className="checked">&#9989;</div>
            </div>*/}
            <div
                className={"study-container " + studyClassHandler("mch")}
                onClick={() => selectStudyHandler("mch")}
            >
                <div className="study-title">Mechanical Engineering</div>
                <div className="checked">&#9989;</div>
            </div>
            <div
                className={"study-container " + studyClassHandler("mar")}
                onClick={() => selectStudyHandler("mar")}
            >
                <div className="study-title">Marine Engineering</div>
                <div className="checked">&#9989;</div>
            </div>
        </div>
    )
}

export default Studies
