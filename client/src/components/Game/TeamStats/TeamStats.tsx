import React, { useState } from "react";
import "./TeamStats.css"
import TeamLeaderboard from "./TeamLeaderboard/TeamLeaderboard";
import { useSpring, animated, a } from '@react-spring/web'

function TeamStats() {
    const [showYourStats, setShowYourStats] = useState(false)
    const [yourStatsAnimation, yourStatsAnimationController] = useSpring(() => ({
        config: {duration: 300}
      }))
    const [teamStatsAnimation, teamStatsAnimationController] = useSpring(() => ({
        config: {duration: 300}
    }))

    const handleShowStatsButton = () => {
        if (!showYourStats) {
            setShowYourStats(curr => true)

            yourStatsAnimationController.start({
                from: { opacity: 0, height: "0rem" },
                to: {   opacity: 1, height: "5.5rem"  }
            })

            teamStatsAnimationController.start({
                from: {    fontSize: "50px", marginTop: "6.5rem"   },
                to: {   fontSize: "40px", marginTop: "2rem"   }
            })
        }
        else {
            yourStatsAnimationController.start({
                from: { opacity: 1, height: "5.5rem"  },
                to: {   opacity: 0, height: "0rem"  }
            })

            teamStatsAnimationController.start({
                from: {    fontSize: "40px", marginTop: "2rem" },
                to: {   fontSize: "50px", marginTop: "6.5rem"  }
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
                            <div className="team-stats-score-text">
                                Your Score:
                            </div>
                            <div className="team-stats-score-text">
                                Average Score:
                            </div>
                        </a.div>
                    ) : null}
                    <a.div style={{...teamStatsAnimation}} className="team-stats-score-text">
                        Team Score:
                    </a.div>
                </div>
                <div className="scores-values-container">
                    {showYourStats ? (
                    <a.div style={{...yourStatsAnimation}}>
                            <div className="team-stats-score-value individual-score">
                                200
                            </div>
                            <div className="team-stats-score-value">
                                150
                            </div>
                    </a.div>
                    ) : null}
                    <a.div style={{...teamStatsAnimation}} className="team-stats-score-value">
                        2000
                    </a.div>
                </div>
            </div>
            <TeamLeaderboard yourTeamData={{teamScore: 2000, teamName: "Your team"}}></TeamLeaderboard>
            <div className="horizontal-division-bar"></div>
            {showYourStats ? 
            (<div className="show-stats-btn" onClick={() => handleShowStatsButton()}>See how <span className="individual-score">you</span> are doing</div>)
            : (<div className="hide-stats-btn" onClick={() => handleShowStatsButton()}>Hide <span className="individual-score">your</span> stats</div>)   }
        </div>
    )
}

export default TeamStats