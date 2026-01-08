import React, { useEffect, useState } from "react"
import "./PreviewBackgrounds.css"
import SeaLevel from "../../../../img/team_preview/boat/sea.png"
import Wave1 from "../../../../img/team_preview/boat/wave1.png"
import Wave2 from "../../../../img/team_preview/boat/wave2.png"
import Wave3 from "../../../../img/team_preview/boat/wave3.png"
import Sun from "../../../../img/team_preview/boat/sun.png"
import Bubble from "../../../../img/team_preview/boat/bubble.png"
import Bubble2 from "../../../../img/team_preview/boat/bubble2.png"

interface Props {
    countdownStarted: boolean
    playAnimation: boolean
    onShowTopicName: () => void
    onAnimationComplete: () => void
}

export default function PreviewBoatBackground(props: Props) {
    useEffect(() => {
        if (props.countdownStarted) {
            setTimeout(() => {
                props.onShowTopicName && props.onShowTopicName();
            }, 2000);
        }
    }, [props.countdownStarted]);

    useEffect(() => {
        if (props.playAnimation) {
            setTimeout(() => {
                props.onAnimationComplete && props.onAnimationComplete();
            }, 3500);
        }
    }, [props.playAnimation]);
        
    return (
        <div className={"preview-background boat-preview-background" + (props.playAnimation ? " play-boat-animation" : "")}>
            <img src={SeaLevel} alt="Sea" className="boat-preview preview-sea-level" />
            <img src={Wave3} alt="Wave" className="boat-preview preview-sea-wave preview-sea-wave-3" />
            <img src={Wave2} alt="Wave" className="boat-preview preview-sea-wave preview-sea-wave-2" />
            <img src={Wave1} alt="Wave" className="boat-preview preview-sea-wave preview-sea-wave-1" />

            <img src={Sun} alt="Sun" className="boat-preview preview-sun" />

            <div className={"preview-bubbles-container" + (props.playAnimation ? " rising-bubbles" : "")}>
                <div className="preview-bubbles">
                    <img src={Bubble} alt="Bubble" className="boat-preview preview-bubble bubble-1" />
                    <img src={Bubble} alt="Bubble" className="boat-preview preview-bubble bubble-2" />
                    <img src={Bubble} alt="Bubble" className="boat-preview preview-bubble bubble-3" />
                </div>
            </div>

            <div className={"preview-bubbles-container-2" + (props.playAnimation ? " rising-bubbles" : "")}>
                <div className="preview-bubbles">
                    <img src={Bubble} alt="Bubble" className="boat-preview preview-bubble bubble-1" />
                    <img src={Bubble} alt="Bubble" className="boat-preview preview-bubble bubble-2" />
                    <img src={Bubble} alt="Bubble" className="boat-preview preview-bubble bubble-3" />
                </div>
            </div>

            <div className={"preview-bubbles-container-3" + (props.playAnimation ? " rising-bubbles" : "")}>
                <div className="preview-bubbles">
                    <img src={Bubble2} alt="Bubble" className="boat-preview preview-bubble bubble-1" />
                    <img src={Bubble2} alt="Bubble" className="boat-preview preview-bubble bubble-2" />
                    <img src={Bubble2} alt="Bubble" className="boat-preview preview-bubble bubble-3" />
                </div>
            </div>

            <div className={"preview-bubbles-container-4" + (props.playAnimation ? " rising-bubbles" : "")}>
                <div className="preview-bubbles">
                    <img src={Bubble2} alt="Bubble" className="boat-preview preview-bubble bubble-1" />
                    <img src={Bubble2} alt="Bubble" className="boat-preview preview-bubble bubble-2" />
                    <img src={Bubble2} alt="Bubble" className="boat-preview preview-bubble bubble-3" />
                </div>
            </div>
        </div>
    )
}
