import React, { useEffect, useState } from "react"
import "./Round.css"

interface Props {
    topic: string
    onSelectRound: (title: string, selected: boolean) => string
}

function Round(props: Props) {
    const [selected, setSelected] = useState("")
    const [imageLetter, setImmageLetter] = useState("")
    useEffect(() => {
        setImmageLetter(props.topic.charAt(0).toUpperCase())
    }, [])

    // Alerts the parent (list of rounds) that current round has been clicked, and based on current class name ("" or "selected")
    // informs parent whether the action is selection or deselection
    const selectionHandler = () => {
        if (selected == "") {
            const resultingClass = props.onSelectRound(props.topic, true)
            setSelected(resultingClass)
        } else {
            const resultingClass = props.onSelectRound(props.topic, false)
            setSelected(resultingClass)
        }
    }

    // If the topic name is very long, assigns the class to decrease the font size
    const topicFontSizeHandler = () => {
        if (props.topic.length > 20) return " long-topic-name"
        else return ""
    }

    return (
        <div
            className={"round-container " + selected}
            onClick={selectionHandler}
        >
            <div className="colum left">
                <p className="img">{imageLetter}</p>
            </div>
            <div className="column right">
                <div className="checked">&#9989;</div>
                <div className={"round-title" + topicFontSizeHandler()}>
                    {props.topic}
                </div>
            </div>
        </div>
    )
}

export default Round
