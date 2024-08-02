import React, { useState } from "react";
import "./ColorationInfo.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faK, faXmark } from "@fortawesome/free-solid-svg-icons";
import RaceLapCarousel from "./RaceLapCarousel/RaceLapCarousel";
import StudyCarousel from "./StudyCarousel/StudyCarousel";

function ColorationInfo() {
    const [isOpen, setIsOpen] = useState(false) // boolean to indicate whether the carousel should be displayed
    const [hoveringButton, setHoveringButton] = useState(false) // boolean to indicate whether the button is being hovered

    return(
        <div className="coloration-info-container">
            {/* Showing the color coding information carousel, when it's opened */}
            {isOpen ? 
            (<div className="coloration-info">
                <div className="exit-coloration-info" onClick={() => setIsOpen(curr => false)}><FontAwesomeIcon icon={faXmark}/></div>
                <div className="carousel-title">The color of the outer ring indicates the current race lap.</div>
                <div className="race-laps-carousel-container">
                    <RaceLapCarousel></RaceLapCarousel>
                </div>
                <div className="horizontal-line-seperator"></div>
                <div className="carousel-title">{"The fill color indicates the team's study."}</div>
                <div className="study-carousel-container">
                    <StudyCarousel></StudyCarousel>
                </div>
        
            </div>
            // Logic for animating the button that opens / closes the carousel
            // Adjusts the button classes based on values of `isOpen` and `hoveringButton` booleans (the button expands when either is true)
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