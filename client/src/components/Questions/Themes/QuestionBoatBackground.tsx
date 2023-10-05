import React from "react"
import "./QuestionBoatBackground.css"

export default function QuestionBoatBackground() {
    return (
        <div className="question-background">
            <svg
                id="question-boat-background"
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                width="1440"
                height="560"
                preserveAspectRatio="none"
                viewBox="0 0 1440 560"
                data-testid="boat-background-question"
            >
                <path
                    id="wave-top"
                    d="M 0,233 C 57.6,208.8 172.8,111.2 288,112 C 403.2,112.8 460.8,254 576,237 C 691.2,220 748.8,34.6 864,27 C 979.2,19.4 1036.8,188 1152,199 C 1267.2,210 1382.4,105.4 1440,82L1440 560L0 560z"
                    fill="rgba(193, 235, 235, 1)"
                ></path>
                <path
                    id="wave-mid"
                    d="M 0,233 C 57.6,208.8 172.8,111.2 288,112 C 403.2,112.8 460.8,254 576,237 C 691.2,220 748.8,34.6 864,27 C 979.2,19.4 1036.8,188 1152,199 C 1267.2,210 1382.4,105.4 1440,82L1440 560L0 560z"
                    fill="rgba(0, 168, 214, 1)"
                ></path>
                <path
                    id="wave-bot"
                    d="M 0,543 C 96,515 288,419.2 480,403 C 672,386.8 768,477.4 960,462 C 1152,446.6 1344,353.2 1440,326L1440 560L0 560z"
                    fill="rgba(48, 124, 145, 1)"
                ></path>
            </svg>
        </div>
    )
}
