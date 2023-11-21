import React, { useEffect, useState } from "react"
import "./Round.css"

interface Props {
    topic: string
    onSelectRound: (title: string, selected: boolean) => void
    selected: boolean
    index: number
}

function Round(props: Props) {
    const [isSelected, setIsSelected] = useState(false)
    const [imageLetter, setImmageLetter] = useState("")
    
    useEffect(() => {
        if (props.topic) {
            setImmageLetter(curr => props.topic.charAt(0).toUpperCase())
        }
    }, [props.topic])

    useEffect(() => {
        setIsSelected(curr => props.selected)
    }, [props.selected])

    // Alerts the parent (list of rounds) that current round has been clicked, and based on current class name ("" or "selected")
    // informs parent whether the action is selection or deselection
    const selectionHandler = () => {
        if (!isSelected) {
            props.onSelectRound(props.topic, true)
        } else {
            const newState = props.onSelectRound(props.topic, false)
        }
    }

    // If the topic name is very long, assigns the class to decrease the font size
    const topicFontSizeHandler = () => {
        if (!props.topic) return ""

        if (props.topic.length > 20) return " long-topic-name"
        else return ""
    }

    return (
        <div
            className={"round-container " + (isSelected ? "selected" : "")}
            onClick={selectionHandler}
        >
            <div className="colum left">
                <div className="round-index">{props.index + 1}</div>
                <p className="img">{imageLetter}</p>
            </div>
            <div className="column right">
                <div className={"round-title" + topicFontSizeHandler()}>
                    {props.topic}
                </div>
            </div>
        </div>
    )
}

export default Round
