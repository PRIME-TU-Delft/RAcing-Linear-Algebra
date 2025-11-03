import React, { useEffect, useState } from "react";
import { Ghost, ServerGhost } from "../SharedUtils";
import "./TeamPreview.css"
import sprites from "../Sprites/TrainThemeSprites"
import { getRaceVehicleSprite } from "../RaceService";
import { a, useChain, useSpring, useSpringRef, useSprings, useTrail, useTransition } from "react-spring";
import socket from "../../../socket";
import { useNavigate } from "react-router-dom";
import TrainBackground from "../../Waiting/Themes/TrainBackground";
import PregameCountdown from "./PregameCountdown/PregameCountdown";
import { getColorForStudy } from "../Ghosts/GhostService";
import { motion } from "framer-motion";

interface Props {
    topic: string,
    theme: string,
    ghostTeams: Ghost[],
    mainTeamName: string,
    noGhostTeamsPresent: boolean,
    onStartGame: () => void
}

const dummyTeam: Ghost = {
    teamName: "Team Name Deset1",
    key: 0,
    colors: { mainColor: "#ff0000", highlightColor: "#00ff00" },
    timeScores: [],
    checkpoints: [],
    study: "CSE",
    accuracy: 100,
    lapsCompleted: 0,
    racePosition: 0,
    isOpen: false,
    animationStatus: { pathProgress: 0, updateAnimation: false, timeScoreIndex: 0 }
}

const dummyTeams: Ghost[] = Array.from({ length: 18 }, () => ({ ...dummyTeam }))


function TeamPreview(props: Props) {
    const dummyTeams = React.useMemo(() => Array.from({ length: 18 }, () => ({ ...dummyTeam })), []);
    const [startCountdown, setStartCountdown] = useState<boolean>(false)
    const [showMainTeam, setShowMainTeam] = useState<boolean>(false)
    const [sortedTeams, setSortedTeams] = useState<Ghost[]>(dummyTeams)
    const [numberOfGhostTeamAnimationsCompleted, setNumberOfGhostTeamAnimationsCompleted] = useState(0)
    const [platformNumber, setPlatformNumber] = useState(1)
    const [showTopicName, setShowTopicName] = useState(false)
    const [topicShowCompleted, setTopicShowCompleted] = useState(false)

    useEffect(() => {
        const sortedGhosts = props.ghostTeams.sort((ghostA, ghostB) => {
            const studyA = ghostA.study.toUpperCase(); // Ignore case during sorting
            const studyB = ghostB.study.toUpperCase();
        
            if (studyA < studyB) {
                return -1;
            }
            if (studyA > studyB) {
                return 1;
            }
            return 0;
        });
        setSortedTeams(curr => [...sortedGhosts])
        setPlatformNumber(Math.floor(Math.random() * 9) + 1);
    }, [props.ghostTeams])

    const titleAnimationRef = useSpringRef()
    const titleAnimation = useSpring({
        ref: titleAnimationRef,
        from: { opacity: 0, transform: 'translateY(-10px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        config: { duration: 500 },
    })

    const subtitleAnimationRef = useSpringRef()
    const subtitleAnimation = useSpring({
        ref: subtitleAnimationRef,
        from: { opacity: 0 },
        to: { opacity: 1 },
    })
    // const teamContainerAnimationRef = useSpringRef()
    // const teamContainerAnimation = useSpring({
    //     ref: teamContainerAnimationRef,
    //     config: { mass: 5, tension: 2000, friction: 200, duration: 500 },
    //     from: { opacity: 0 },
    //     to: { opacity: 1 }
    // })

    const teamsAnimationRef = useSpringRef()
    const teamsAnimation = useTrail(sortedTeams.length, {
        ref: teamsAnimationRef,
        config: { mass: 5, tension: 2000, friction: 200, duration: 200},
        from: { opacity: 0, x: 10 },
        to: { opacity: 1, x: 20 },
        onRest: () => setNumberOfGhostTeamAnimationsCompleted(curr => curr + 1)
    })

    const mainTeamAnimation = useSpring({
        config: { mass: 5, tension: 2000, friction: 200, duration: 500 },
        from: { opacity: showMainTeam ? 0 : 1 },
        to: { opacity: showMainTeam ? 1 : 0 },
    })

    const pageContentAnimation = useSpring({
        opacity: startCountdown ? 0 : 1,
        config: { duration: 500 }
    });

    useEffect(() => {
        if (showMainTeam) {
            setTimeout(() => {
                setStartCountdown(curr => true)
            }, 1500);
        }
    }, [showMainTeam])

    useEffect(() => {
        if ((numberOfGhostTeamAnimationsCompleted >= sortedTeams.length && sortedTeams.length > 0) || props.noGhostTeamsPresent) setShowMainTeam(curr => true)
    }, [numberOfGhostTeamAnimationsCompleted, props.noGhostTeamsPresent])

    useChain([titleAnimationRef, subtitleAnimationRef, teamsAnimationRef], [0, 0.2, 0.25], 10000)

    return(
        <div className="team-preview-body">
            <TrainBackground 
                includeRail={false} 
                isTeamPreview={true} 
                closeTrainDoors={startCountdown}
                moveTrain={topicShowCompleted}
                onDoorsClosed={() => setShowTopicName(true)}
                onTrainMoved={() => props.onStartGame()}
            />
            <a.div className="team-preview-title">
                    <a.div style={{...titleAnimation}}>
                    {"Dear engineers in training, please make your way to platform " + platformNumber + "."}
                </a.div>
                </a.div>
            <a.div className="page-content" style={pageContentAnimation}>
                {!props.noGhostTeamsPresent && <a.div className="team-preview-subtitle" style={subtitleAnimation}>Participating teams:</a.div>}
                <a.div className="team-preview-grid">
                        {teamsAnimation.map((style, i) => (
                            <a.div style={style} key={i}>
                                <div className="team-container">
                                    <div className="team-image-container rounded-circle">
                                        <svg  className="vehicle-main-svg" style={{fill: sortedTeams[i].colors.mainColor}} xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 600 600"><path d="m117.42 434.85.35-257.99h1.12l4 29.54 16.99 185.69v30.7l-22.46 12.06zM474.61 434.61l-.77-262.87L452.16 397l-.91 21.61 23.36 16zM416.79 299.37h-63.03l7.45 12.02.7 3.3 1.61 2.95.28 1.68 1.54 2.67 1.47 3.65.35 1.61h-12.28l-2.25-1.47-2.67-3.16-.49-2.18-1.68-2.53-1.05-3.93-2.18-5.19-1.54-3.93-.98-3.65-.92-1.84h-90.45l-3.3 8.37c-2.81 9.12-5.68 13.05-5.68 13.05l-1.96 3.02-2.88 2.74-2.39.77h-4.14l-2.04-.91-1.4-1.12-1.33-2.32.35-3.23 1.68-2.04 1.47-1.89 2.25-3.93 1.68-3.93 4.91-7.09 1.06-1.49h-63.66v.63s1.05 16.68 2.84 20.79c0 0 3.37 13.47 24.84 15.79l184.42.63s20.63-1.47 25.68-15.26c0 0 4.04-8.77 3.68-22.58ZM175.53 127.95s-15.72-.56-18.95 7.86v5.05s1.26 27.09 4.35 37.19l7.02-6.6h255.86l4.07 2.11 5.05 4.49s4.91-34.39 4.07-43.37c0 0-4.21-5.77-14.04-6.74H175.52ZM382.89 60.79l-171.79-.42c-38.74 9.47-69.89 53.68-69.89 53.68h310.04c-37.96-45.47-68.35-53.26-68.35-53.26Zm-53.4 41.05-2.88 3.05-62.77-.04-2.11-3.23-.07-27.65 2.91-2.98h61.93l3.16 3.09-.18 27.75Z"/><path d="m452.62 419.21-3.23 4.63-309.05-.14s-18.04 4.16-23.58 13.76l23.8 97.18s7.22 15.13 23.36 16.25 271.72 1.17 271.72 1.17 11.51-5.26 15.44-14.24 24.28-93.19 24.28-93.19v-9.4l-22.74-16v-.02Zm-105.55 85.9-3.93 3.37h-95.58l-3.23-4.35v-70.18h102.74v71.16Z"/></svg>
                                        <svg  className="vehicle-highlight-svg" style={{fill: sortedTeams[i].colors.highlightColor}} xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 600 600"><path d="m451.53 114.47-28.21-2.74H172.79l-32.49 2.88-.7.84s-25.82 32.84-21.05 62.04l19.65 216.14 89.12-.7 4.28 2.74v26.04l-2.67 2.39 133.82.14-2.6-2.53-.56-25.75 3.86-2.95h83.02l3.93 4.21v21.54l-.49 3.37 1.96-2.46 1.82-31.23 20.14-211.23s5.05-33.26-22.32-62.74Zm-14.32 20.42-1.89 30.74c-3.16 6.32-11.16 89.05-11.16 89.05l-8.63 60c-1.89 23.58-28.21 22.53-28.21 22.53L205.85 337c-31.58.42-30.74-28.42-30.74-28.42-.42-9.89-8.84-77.05-8.84-77.05-1.26-12-4.42-33.89-4.42-33.89l-6.25-57.89c-1.54-13.89 23.44-12.35 23.44-12.35l235.86-.91c23.58 2.32 22.32 8.42 22.32 8.42Z"/></svg>                    
                                            <img
                                                src={getRaceVehicleSprite(props.theme)}
                                                alt="vehicle"
                                                className="background-vehicle-image"
                                            />
                                    </div>
                                    <div className="team-preview-name-container">
                                        <div style={{textDecorationLine: "underline", textDecorationColor: sortedTeams[i].colors.highlightColor}}>
                                            <span>{sortedTeams[i].study + ":"}</span>{sortedTeams[i].teamName}
                                        </div>
                                    </div>
                                </div>
                            </a.div>
                        ))}
                </a.div>
                {showMainTeam ? (
                    <a.div className="main-team-preview" style={mainTeamAnimation}>
                        <div className="main-team-image-container rounded-circle">
                            <svg  className="vehicle-main-svg" style={{fill: "#0021A7"}} xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 600 600"><path d="m117.42 434.85.35-257.99h1.12l4 29.54 16.99 185.69v30.7l-22.46 12.06zM474.61 434.61l-.77-262.87L452.16 397l-.91 21.61 23.36 16zM416.79 299.37h-63.03l7.45 12.02.7 3.3 1.61 2.95.28 1.68 1.54 2.67 1.47 3.65.35 1.61h-12.28l-2.25-1.47-2.67-3.16-.49-2.18-1.68-2.53-1.05-3.93-2.18-5.19-1.54-3.93-.98-3.65-.92-1.84h-90.45l-3.3 8.37c-2.81 9.12-5.68 13.05-5.68 13.05l-1.96 3.02-2.88 2.74-2.39.77h-4.14l-2.04-.91-1.4-1.12-1.33-2.32.35-3.23 1.68-2.04 1.47-1.89 2.25-3.93 1.68-3.93 4.91-7.09 1.06-1.49h-63.66v.63s1.05 16.68 2.84 20.79c0 0 3.37 13.47 24.84 15.79l184.42.63s20.63-1.47 25.68-15.26c0 0 4.04-8.77 3.68-22.58ZM175.53 127.95s-15.72-.56-18.95 7.86v5.05s1.26 27.09 4.35 37.19l7.02-6.6h255.86l4.07 2.11 5.05 4.49s4.91-34.39 4.07-43.37c0 0-4.21-5.77-14.04-6.74H175.52ZM382.89 60.79l-171.79-.42c-38.74 9.47-69.89 53.68-69.89 53.68h310.04c-37.96-45.47-68.35-53.26-68.35-53.26Zm-53.4 41.05-2.88 3.05-62.77-.04-2.11-3.23-.07-27.65 2.91-2.98h61.93l3.16 3.09-.18 27.75Z"/><path d="m452.62 419.21-3.23 4.63-309.05-.14s-18.04 4.16-23.58 13.76l23.8 97.18s7.22 15.13 23.36 16.25 271.72 1.17 271.72 1.17 11.51-5.26 15.44-14.24 24.28-93.19 24.28-93.19v-9.4l-22.74-16v-.02Zm-105.55 85.9-3.93 3.37h-95.58l-3.23-4.35v-70.18h102.74v71.16Z"/></svg>
                            <svg  className="vehicle-highlight-svg" style={{fill: "#F8B700"}} xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 600 600"><path d="m451.53 114.47-28.21-2.74H172.79l-32.49 2.88-.7.84s-25.82 32.84-21.05 62.04l19.65 216.14 89.12-.7 4.28 2.74v26.04l-2.67 2.39 133.82.14-2.6-2.53-.56-25.75 3.86-2.95h83.02l3.93 4.21v21.54l-.49 3.37 1.96-2.46 1.82-31.23 20.14-211.23s5.05-33.26-22.32-62.74Zm-14.32 20.42-1.89 30.74c-3.16 6.32-11.16 89.05-11.16 89.05l-8.63 60c-1.89 23.58-28.21 22.53-28.21 22.53L205.85 337c-31.58.42-30.74-28.42-30.74-28.42-.42-9.89-8.84-77.05-8.84-77.05-1.26-12-4.42-33.89-4.42-33.89l-6.25-57.89c-1.54-13.89 23.44-12.35 23.44-12.35l235.86-.91c23.58 2.32 22.32 8.42 22.32 8.42Z"/></svg>                    
                                <img
                                    src={getRaceVehicleSprite(props.theme)}
                                    alt="vehicle"
                                    className="background-vehicle-image"
                                />
                        </div>
                        <div className="main-team-name-container">
                            <div >
                                {props.mainTeamName}
                            </div>
                        </div>
                    </a.div>
                ) : null}
            </a.div>

            {showTopicName ? <PregameCountdown topic="Eigenvalues & Eigenvectors" seconds={1.5} onCountdownComplete={() => setTopicShowCompleted(true)}/> : null}
        </div>
    )
}

export default TeamPreview