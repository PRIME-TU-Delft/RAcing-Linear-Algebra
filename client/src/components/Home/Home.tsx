import React from "react"
import "./Home.css"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear } from "@fortawesome/free-solid-svg-icons"

function Home() {
    const navigate = useNavigate()

    return (
        <>
            <div className="background"> </div>
            <div className="home">
                <div className="home-title">
                    <p>RAcing Linear Algebra</p>
                </div>

                <FontAwesomeIcon icon={faGear} size="2xl" className="settings-icon"/> 
                
                <div className="home-buttons">
                    <button
                        className="home-btn"
                        onClick={() => navigate("/CreateGame")}
                    >
                        <p>Create Game</p>
                    </button>

                    <button
                        className="home-btn"
                        onClick={() => navigate("/JoinGame")}
                    >
                        <p>Join Game</p>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Home
