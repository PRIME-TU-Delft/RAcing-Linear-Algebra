import React, { useContext, useState } from "react";
import "./TeamStats.css"
import TeamLeaderboard from "./TeamLeaderboard/TeamLeaderboard";
import { useSpring, animated, a } from '@react-spring/web'
import { ScoreContext } from "../../../contexts/ScoreContext";

interface Props {
    buttonTopOffset: number
    playerScore: number
}

function TeamStats(props: Props) {
    const scores = useContext(ScoreContext)

    const [showYourStats, setShowYourStats] = useState(true)
    const [yourStatsAnimation, yourStatsAnimationController] = useSpring(() => ({
        config: {duration: 300}
      }))
    const [teamStatsAnimation, teamStatsAnimationController] = useSpring(() => ({
        config: {duration: 300}
    }))

    const startStyle = {
        fontSize: "50px",
        marginTop: "7rem"
    }

    const handleShowStatsButton = () => {
        if (!showYourStats) {
            setShowYourStats(curr => true)

            yourStatsAnimationController.start({
                from: { opacity: 0, height: "0rem" },
                to: {   opacity: 1, height: "5.5rem"  }
            })

            teamStatsAnimationController.start({
                from: {    fontSize: "50px"  },
                to: {   fontSize: "40px" }
            })
        }
        else {
            yourStatsAnimationController.start({
                from: { opacity: 1, height: "5.5rem"  },
                to: {   opacity: 0, height: "0rem"  }
            })

            teamStatsAnimationController.start({
                from: {    fontSize: "40px"},
                to: {   fontSize: "50px" }
            })

            setTimeout(() => {
                setShowYourStats(curr => false)
            }, 300)
        }
    }

    return(
        <div className="team-stats-container">
            <div className="scores-container">
                <div className="scores-title-container">
                    {showYourStats ? (
                        <a.div style={{...yourStatsAnimation}}>
                            <div className="individual-stats-score-text">
                                Average Score:
                            </div>
                            <div className="individual-stats-score-text">
                                Your Score:
                            </div>
                        </a.div>
                    ) : null}
                </div>
                <div className="scores-values-container">
                    {showYourStats ? (
                    <a.div style={{...yourStatsAnimation}}>
                            <div className="individual-stats-score-text">
                                {scores.teamAveragePoints}
                            </div>
                            <div className="individual-stats-score-text">
                                {props.playerScore}
                            </div>
                    </a.div>
                    ) : null}
                </div>
            </div>
            <div className="team-stats-score-text">
                        Team Score: {scores.currentPoints}
            </div>
            <div className="show-stats-btn-container" >
                {!showYourStats ? 
                (<div className="show-stats-btn" onClick={() => handleShowStatsButton()}>See how you are doing</div>)
                : (<div className="show-stats-btn" onClick={() => handleShowStatsButton()}>Hide your stats</div>)   }
            </div>
        </div>
    )
}

export default TeamStats