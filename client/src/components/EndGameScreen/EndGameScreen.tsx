import React from "react"
import "./EndGameScreen.css"
import QRCode from "./QRCode.png"
import { a, useChain, useSpring, useSpringRef } from "react-spring"
import { useNavigate } from "react-router-dom"

export default function EndGameScreen() {
    const navigate = useNavigate()

    const titleRef = useSpringRef()
    const titleAnimation = useSpring({
        ref: titleRef,
        from: { opacity: 0 },
        to: { opacity: 1 },
    }) 

    const subtitleRef = useSpringRef()
    const subtitleAnimation = useSpring({
        ref: subtitleRef,
        from: { opacity: 0 },
        to: { opacity: 1 },
    }) 

    const qrRef = useSpringRef()
    const qrAnimation = useSpring({
        ref: qrRef,
        from: { opacity: 0 },
        to: { opacity: 1 },
    }) 

    const msgRef = useSpringRef()
    const msgAnimation = useSpring({
        ref: qrRef,
        from: { opacity: 0 },
        to: { opacity: 1 },
    }) 

    const btnRef = useSpringRef()
    const btnAnimation = useSpring({
        ref: qrRef,
        from: { opacity: 0 },
        to: { opacity: 1 },
    }) 

    useChain([titleRef, subtitleRef, qrRef, msgRef, btnRef], [0, 0.25, 0.5, 0.75, 1], 4000)

    return (
        <>
            <div className="end-game-container">
                <a.div style={titleAnimation} className="end-game-text">We hope you enjoyed playing the game!</a.div>
                <a.div style={subtitleAnimation} className="end-game-subtext">The following QR code takes you to a form with some questions about your experience:</a.div>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSeT8gtxKftwHNPz9lDo0rQD_tDpw-YJrPsiWAqKVHqArtGngg/viewform?usp=sf_link" target="_blank" rel="noopener noreferrer">
                    <a.img style={qrAnimation} src={QRCode} alt="qrcode" className="qrCode"></a.img>
                </a>
                <a.div style={msgAnimation} className="end-game-text2">
                    We greatly value your feedback and would appreciate it if
                    you could take a moment to share your thoughts with us!
                </a.div>
                <a.div style={btnAnimation} className="end-game-btn-container" >
                    <div className="end-game-home-btn" onClick={() => navigate("/")}>Return to start</div>
                </a.div>
            </div>
        </>
    )
}
