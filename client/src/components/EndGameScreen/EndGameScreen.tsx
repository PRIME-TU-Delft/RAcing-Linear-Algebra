import React from "react"
import "./EndGameScreen.css"
import QRCode from "./QRCode.png"

export default function EndGameScreen() {
    return (
        <>
            <div className="end-game-container">
                <p className="end-game-text">Thank you for playing our game!</p>
                <img src={QRCode} alt="qrcode" className="qrCode"></img>
                <p className="end-game-text2">
                    We greatly value your feedback and would appreciate it if
                    you could take a moment to share your thoughts with us.
                </p>
            </div>
        </>
    )
}
