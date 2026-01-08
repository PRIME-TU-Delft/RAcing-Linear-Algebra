import React from "react"
import "./PreviewBackgrounds.css"
import SeaLevel from "../../../../img/team_preview/boat/sea.png"
import Wave1 from "../../../../img/team_preview/boat/wave1.png"
import Wave2 from "../../../../img/team_preview/boat/wave2.png"
import Wave3 from "../../../../img/team_preview/boat/wave3.png"
import Sun from "../../../../img/team_preview/boat/sun.png"

export default function PreviewBoatBackground() {
    return (
        <div className="preview-background boat-preview-background">
            <img src={SeaLevel} alt="Sea" className="boat-preview preview-sea-level" />
            <img src={Wave3} alt="Wave" className="boat-preview preview-sea-wave preview-sea-wave-3" />
            <img src={Wave2} alt="Wave" className="boat-preview preview-sea-wave preview-sea-wave-2" />
            <img src={Wave1} alt="Wave" className="boat-preview preview-sea-wave preview-sea-wave-1" />

            <img src={Sun} alt="Sun" className="boat-preview preview-sun" />
        </div>
    )
}
