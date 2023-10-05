import React from "react"
import "./BoatBackground.css"

export default function BoatBackground() {
    return (
        <div className="background">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                width="100vw"
                height="100vh"
                preserveAspectRatio="none"
                viewBox="0 0 1440 560"
                data-testid="boat-background"
            >
                <g mask='url("#SvgjsMask1009")' fill="none">
                    <rect
                        width="1440"
                        height="560"
                        x="0"
                        y="0"
                        fill="rgba(85, 199, 231, 1)"
                        id="b1"
                    ></rect>
                    <path
                        d="M 0,169 C 57.6,139.2 172.8,8.2 288,20 C 403.2,31.8 460.8,229.6 576,228 C 691.2,226.4 748.8,12.8 864,12 C 979.2,11.2 1036.8,213.8 1152,224 C 1267.2,234.2 1382.4,95.2 1440,63L1440 560L0 560z"
                        fill="rgba(0, 168, 214, 1)"
                        id="b2"
                    ></path>
                    <path
                        d="M 0,451 C 96,442.2 288,408.8 480,407 C 672,405.2 768,458.2 960,442 C 1152,425.8 1344,349.2 1440,326L1440 560L0 560z"
                        fill="rgba(48, 124, 145, 1)"
                        id="b3"
                    ></path>
                </g>
                <defs>
                    <mask id="SvgjsMask1009">
                        <rect width="1440" height="560" fill="#ffffff"></rect>
                    </mask>
                </defs>
            </svg>
        </div>
    )
}
