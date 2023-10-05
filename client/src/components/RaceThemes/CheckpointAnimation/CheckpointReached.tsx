import React, { useEffect, useState } from "react"
import "./CheckpointReached.css"
import {
    a,
    useChain,
    useSpring,
    useSpringRef,
    useTransition,
} from "react-spring"

interface Props {
    open: boolean // boolean to determine whether to display the checkpoint animation
    checkpointText: string[] // the name of the checkpoint in the form of an array
}

function CheckpointReached(props: Props) {
    const [tracksClass, setTracksClass] = useState("") // class name that determines whether to display train tracks during the animation
    const [hideContent, setHideContent] = useState("hide") // class name to determine whether to hide the content of the animation

    // When the open value changes, either displays or hides the animation content based on the value
    useEffect(() => {
        if (props.open) {
            setTracksClass((val) => "tracks")
            setHideContent((val) => "")
        } else
            setTimeout(() => {
                setHideContent((val) => "hide")
                setTracksClass((val) => "")
            }, 1500)
    }, [props.open])

    // The transition animation for the content of the animation, created using react-spring
    const contentTransition = useSpring({
        config: { mass: 5, tension: 2000, friction: 200, duration: 600 },
        from: { opacity: props.open ? 0 : 1 },
        to: { opacity: props.open ? 1 : 0 },
    })

    const transitionRef = useSpringRef()

    // Trail animation for the text of the checkpoint name, created using react-spring
    const trail = useTransition(props.open ? props.checkpointText : [], {
        ref: transitionRef,
        config: { mass: 5, tension: 2000, friction: 200, duration: 400 },
        from: { opacity: 0, x: -20 },
        enter: {
            opacity: 1,
            x: 0,
        },
        leave: {
            opacity: 0,
            x: 20,
        },
        trail: 300,
    })

    const springRef = useSpringRef()

    // Entrance and leave animation for the tracks that plays during the animation, created using react-spring
    const spring = useSpring({
        ref: springRef,
        config: { mass: 5, tension: 2000, friction: 200, duration: 600 },
        from: { opacity: 0 },
        to: { opacity: props.open ? 1 : 0 },
    })

    // Chain the animations together using react-spring
    useChain([springRef, transitionRef], [0, 1], 500)

    return (
        <a.div className={"content " + hideContent} style={contentTransition}>
            <div className="text text-center">
                {trail(({ ...style }, item) => (
                    <a.div className="trailsText" style={style}>
                        <a.div>{item}</a.div>
                    </a.div>
                ))}
            </div>
            <a.div className={tracksClass} style={spring}></a.div>
        </a.div>
    )
}

export default CheckpointReached
