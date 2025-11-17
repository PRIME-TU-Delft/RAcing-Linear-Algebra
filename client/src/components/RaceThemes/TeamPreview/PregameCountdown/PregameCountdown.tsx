import React, { useEffect, useState } from "react";
import "./PregameCountdown.css"
import { a, useSpring } from "react-spring";

interface Props {
    topic: string,
    seconds: number,
    onCountdownComplete: () => void
}

function PregameCountdown(props: Props) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
        const fadeOutTimer = setTimeout(() => {
            setShow(false);
        }, props.seconds * 1000);

        return () => clearTimeout(fadeOutTimer);
    }, [props.seconds]);

    const animation = useSpring({
        opacity: show ? 1 : 0,
        config: { duration: 500 },
        onRest: () => {
            if (!show) {
                props.onCountdownComplete();
            }
        },
    });

    return(
        <a.div style={animation} className="topic-display-container">
            <div className="topic-text">{props.topic}</div>
        </a.div>
    )
}

export default PregameCountdown