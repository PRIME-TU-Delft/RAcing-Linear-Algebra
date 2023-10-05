import React from "react"
import "./Step.css"

interface Props {
    stepNumber: number
    onStepSelected: (stepNumber: number) => void

    stepTitle: string
    stepCaption: string
    stepContent: React.ReactNode

    stepActive: boolean
    stepCompleted: boolean
}

function Step(props: Props) {
    const stepClassHandler = () => {
        let stepClass = "step"

        if (props.stepActive) stepClass += " step-active"
        else if (props.stepCompleted) stepClass += " step-completed"

        return stepClass
    }

    return (
        <div className={stepClassHandler()}>
            <div
                className="container"
                onClick={() => props.onStepSelected(props.stepNumber)}
            >
                <div className="circle">{props.stepNumber}</div>
            </div>
            <div
                className="container"
                onClick={() => props.onStepSelected(props.stepNumber)}
            >
                <div className="step-title">{props.stepTitle}</div>
                <div className="caption">{props.stepCaption}</div>
            </div>

            <div className={props.stepActive ? "active" : "closed"}>
                {props.stepContent}
            </div>
        </div>
    )
}

export default Step
