import React, { useState } from "react";
import "./ColorationInfo.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faK, faXmark } from "@fortawesome/free-solid-svg-icons";
import RaceLapCarousel from "./RaceLapCarousel/RaceLapCarousel";
import StudyCarousel from "./StudyCarousel/StudyCarousel";

function ColorationInfo() {
    const [isOpen, setIsOpen] = useState(false)
    const [hoveringButton, setHoveringButton] = useState(false)

    return(
        <div className="coloration-info-container">
            {isOpen ? 
            (<div className="coloration-info">
                <div className="exit-coloration-info" onClick={() => setIsOpen(curr => false)}><FontAwesomeIcon icon={faXmark}/></div>
                <div className="carousel-title">The color of the outer ring indicates the current race lap.</div>
                <div className="race-laps-carousel-container">
                    <RaceLapCarousel></RaceLapCarousel>
                </div>
                <div className="horizontal-line-seperator"></div>
                <div className="carousel-title">{"The fill color indicates the team's study programme."}</div>
                <div className="study-carousel-container">
                    <StudyCarousel></StudyCarousel>
                </div>
        
            </div>
            ) : (
                <div className={"coloration-info-btn " + (isOpen || hoveringButton ? "coloration-info-btn-open" : "")} onClick={() => setIsOpen(curr => !curr)} onMouseLeave={() => setHoveringButton(false)} onMouseEnter={() => setHoveringButton(true)}>
                    <FontAwesomeIcon icon={faCircleInfo} className="info-icon" />   
                    <span className={"coloration-info-text " + (!hoveringButton && !isOpen ? "hide-coloration-text" : "")}>Color coding</span>
                </div>
            )}
        </div>
    )
}

export default ColorationInfo