import { motion, useAnimationControls } from "framer-motion";
import React, { useContext, useEffect, useState } from "react";
import "./GhostVehicle.css"
import { Ghost } from "../../SharedUtils";
import { getColorForRaceLap, getNewTimeScoreIndex, getZIndexValues } from "../../RaceService";
import { getColorForStudy, getGhostStyle } from "../GhostService";
import GhostText from "../GhostText/GhostText";
import LapCompletedText from "../LapCompletedText/LapCompletedText";
import VehicleImage from "../../VehicleImage/VehicleImage";
import { TimeContext } from "../../../../contexts/TimeContext";
import { RaceProgressContext } from "../../../../contexts/RaceProgressContext";
import { getRacePathSizeAndOffsetMargins } from "../../../Game/GameService";

interface Props {
    ghost: Ghost,
    path: string,
    showTeamNames: boolean,
    totalPoints: number,
    startShowingGhosts: boolean,
    keepClosed: boolean,
    theme: string,
    onGhostScoreUpdate: (newScore: number, ghostIndex: number) => void  // update function for race score
}

const DESIRED_EXPANDED_SIZE = "2vw";
const DESIRED_CLOSED_SIZE = "1.2vw";
const DESIRED_MINIMAP_SIZE = "1vw";

function GhostVehicle(props: Props) {
    const [startAnimation, setStartAnimation] = useState<boolean>(false)

    const usedTime = useContext(TimeContext)
    const stopShowingRace = useContext(RaceProgressContext)
    const animationControls = useAnimationControls()

    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [racePathSizing, setRacePathSizing] = useState(getRacePathSizeAndOffsetMargins(dimensions.width, dimensions.height));
    
    const scaleX = 1920 / (props.keepClosed ? racePathSizing.width : dimensions.width);
    const scaleY = 1080 / (props.keepClosed ? racePathSizing.height : dimensions.height);
    const [ratio, setRatio] = useState(scaleX / scaleY);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setDimensions({ width, height });
            setRacePathSizing(getRacePathSizeAndOffsetMargins(width, height));

            const newScaleX = 1920 / (props.keepClosed ? getRacePathSizeAndOffsetMargins(width, height).width : width);
            const newScaleY = 1080 / (props.keepClosed ? getRacePathSizeAndOffsetMargins(width, height).height : height);
            setRatio(newScaleX / newScaleY);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [props.keepClosed]);

    useEffect(() => {
        setRacePathSizing(getRacePathSizeAndOffsetMargins(dimensions.width, dimensions.height));
    }, [dimensions]);

    useEffect(() => 
    {
        const currentTimeScoreIndex = props.ghost.animationStatus.timeScoreIndex
        props.ghost.animationStatus.timeScoreIndex = Math.max(0, getNewTimeScoreIndex(currentTimeScoreIndex, props.ghost.timeScores, usedTime) - 1)
        checkForAnimationUpdates()
    }, [props.ghost.timeScores])

    /**
     * Updates the values of the ghost to account for reaching a new time point.
     * Also triggers parent event to inform it of the change in score
     * @param currentTimeScoreIndex index of the current time score
     * @param newScore  the new score for the ghost  
     * @param newProgress  the new race path progress of the ghost
     */
    const updateGhostValues = (currentTimeScoreIndex: number, newScore: number, newProgress: number) => {
        const newTimeScoreIndex = getNewTimeScoreIndex(currentTimeScoreIndex, props.ghost.timeScores, usedTime)
        props.onGhostScoreUpdate(newScore, props.ghost.key)
        props.ghost.animationStatus.timeScoreIndex = newTimeScoreIndex    
        props.ghost.animationStatus.pathProgress = newProgress
        props.ghost.lapsCompleted = Math.floor(newScore / props.totalPoints)
    }

    const playGhostAnimation = () => {
    }

    useEffect(() => {
        checkForAnimationUpdates()
    }, [usedTime])

    const checkForAnimationUpdates = () => {
        // Introduce constants to reduce code repetition
        const currentTimeScoreIndex = props.ghost.animationStatus.timeScoreIndex

        // If all time scores have been used, the index will be -1 thus no new animation will be played till the end of round
        if (currentTimeScoreIndex == -1 || currentTimeScoreIndex >= props.ghost.timeScores.length) return
        
        const currentGhostTimePoint = props.ghost.timeScores[currentTimeScoreIndex].timePoint

        // If the time matches a ghost's time point, it is time to update its score (make it move)
        if (currentGhostTimePoint <= usedTime) { 

            setStartAnimation(curr => true)
        }
    }

    useEffect(() => {
        if (startAnimation) {
            setStartAnimation(curr => false)
            // Introduce constants to reduce code repetition
            const currentTimeScoreIndex = props.ghost.animationStatus.timeScoreIndex
            if (currentTimeScoreIndex == -1) return // if the time score index was reset to -1, no more animations should be played

            const currentGhostNewScore = props.ghost.timeScores[currentTimeScoreIndex].score
            const progress = (currentGhostNewScore/ props.totalPoints) * 100 // progress determined as the ratio of points and total points

            const currentGhostPreviousScore = props.ghost.timeScores[Math.max(currentTimeScoreIndex - 1, 0)].score
            const previousProgress = (currentGhostPreviousScore/ props.totalPoints) * 100 
   
            updateGhostValues(currentTimeScoreIndex, currentGhostNewScore, progress)

            // Prevent possible bug of team going backwards due to miscalculations / incorrect score storing
            if (progress >= previousProgress && progress > 0) {
                animationControls.start({  
                    offsetDistance: progress.toString() + "%",
                    transition: {duration: 2}
                })
            }
        }
    }, [startAnimation])

    return(
        <div>
            {props.theme !== "Boat" && <motion.div
                data-testid={`ghost${props.ghost.key}`}
                key={props.ghost.key}
                style={{
                    offsetPath: `path("${props.path}")`,
                    zIndex: getZIndexValues().ghostVehicle - props.ghost.racePosition
                }}
                className={props.keepClosed ? "minimap-ghost-container" :"ghost"}
                initial={{ offsetDistance: "0%"}}
                animate={animationControls}
            >
                {/* Only show position for ghosts that are open (check function description) */}
                {props.ghost.isOpen && props.startShowingGhosts && !props.keepClosed ? 
                (<motion.div 
                    className="position-number"
                    style={{
                        borderColor: getColorForRaceLap(props.ghost.lapsCompleted), 
                        zIndex: getZIndexValues().ghostVehicle - props.ghost.racePosition + 20  // + 20 to make sure text is always on top of images
                    }}>
                        <GhostText 
                            ghost={props.ghost}
                            showTeamName={props.showTeamNames}
                        />
                </motion.div>) : null}
                <LapCompletedText 
                    lapsCompleted={props.ghost.lapsCompleted}/>
                {props.keepClosed ? (
                <div className="minimap-ghost rounded-circle" style={{
                    borderColor: getColorForRaceLap(props.ghost.lapsCompleted),
                    borderWidth: "3px",
                    borderStyle: "solid",
                    backgroundColor: getColorForStudy(props.ghost.study).mainColor
                }}></div>
                ) : (
                    <motion.div
                        initial={{
                            height: "55px",
                            width: "55px",
                        }}
                        animate={
                            getGhostStyle(
                                props.ghost.isOpen, 
                                getColorForRaceLap(props.ghost.lapsCompleted),
                                getColorForStudy(props.ghost.study).mainColor
                            )
                        }
                        transition={{
                            duration: 0.5,
                            stiffness: 100,
                            delay: 0.5
                        }}
                        className="ghost-vehicle rounded-circle"
                    >
                        <motion.div 
                            className="ghost-vehicle-image-container"
                            animate={{
                                opacity: props.ghost.isOpen ? "100%" : "0%",
                            }}
                            transition={{
                                duration: 0.2,
                                stiffness: 100,
                                delay: 0.5
                            }}>
                            <VehicleImage
                                theme={props.theme}
                                colors={{
                                    mainColor: props.ghost.colors.mainColor,
                                    highlightColor: props.ghost.colors.highlightColor
                                }}/>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>}

            {props.theme === "Boat" && !props.keepClosed &&
            <svg className="svg-path" viewBox="0 0 1920 1080" preserveAspectRatio="none">
                <path
                    d={props.path}
                    fill={"none"}
                />
                <foreignObject x="0" y="0" 
                    width={1920} 
                    height={1080}
                    style={{ overflow: 'visible' }}
                    >
                    <motion.div
                        data-testid={`ghost${props.ghost.key}`}
                        key={props.ghost.key}
                        style={{
                            offsetPath: `path("${props.path}")`,
                            zIndex: getZIndexValues().ghostVehicle - props.ghost.racePosition
                        }}
                        className={props.keepClosed ? "minimap-ghost-container" :"ghost"}
                        initial={{ offsetDistance: "0%"}}
                        animate={animationControls}
                    >
                        {props.ghost.isOpen && props.startShowingGhosts && !props.keepClosed ? 
                        (<motion.div 
                            className="position-number"
                            style={{
                                borderColor: getColorForRaceLap(props.ghost.lapsCompleted), 
                                zIndex: getZIndexValues().ghostVehicle - props.ghost.racePosition + 20,  // + 20 to make sure text is always on top of images
                                transform: `scaleX(${ratio})`
                            }}>
                                <GhostText 
                                    ghost={props.ghost}
                                    showTeamName={props.showTeamNames}
                                />
                        </motion.div>) : null}
                        <div style={{ transform: `scaleX(${ratio})` }}>
                            <LapCompletedText 
                                lapsCompleted={props.ghost.lapsCompleted}/>
                        </div>
                        <motion.div
                            initial={{
                                height: "55px",
                                width: "55px",
                            }}
                            animate={{
                                ...getGhostStyle(
                                    props.ghost.isOpen, 
                                    getColorForRaceLap(props.ghost.lapsCompleted),
                                    getColorForStudy(props.ghost.study).mainColor
                                ),
                                width: `calc(${[props.ghost.isOpen ? DESIRED_EXPANDED_SIZE : DESIRED_CLOSED_SIZE]} * ${scaleX})`,
                                height: `calc(${[props.ghost.isOpen ? DESIRED_EXPANDED_SIZE : DESIRED_CLOSED_SIZE]} * ${scaleY})`,  
                            }}
                            transition={{
                                duration: 0.5,
                                stiffness: 100,
                                delay: 0.5
                            }}
                            className="ghost-vehicle rounded-circle"
                        >
                            <motion.div 
                                className="ghost-vehicle-image-container"
                                animate={{
                                    opacity: props.ghost.isOpen ? "100%" : "0%",
                                }}
                                transition={{
                                    duration: 0.2,
                                    stiffness: 100,
                                    delay: 0.5
                                }}>
                                <VehicleImage
                                    theme={props.theme}
                                    colors={{
                                        mainColor: props.ghost.colors.mainColor,
                                        highlightColor: props.ghost.colors.highlightColor
                                    }}/>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </foreignObject>
            </svg>
            }

            {props.theme === "Boat" && props.keepClosed &&
            <svg 
                className="minimap-svg-path" 
                viewBox="0 0 1920 1080" 
                preserveAspectRatio="xMidYMid meet"
                style={{
                        width: racePathSizing.width,
                        height: racePathSizing.height,
                        marginLeft: racePathSizing.offsetX,
                        marginTop: racePathSizing.offsetY,
                        zIndex: 99999
                    }}>
                <path
                    d={props.path}
                    fill={"none"}
                />
                <foreignObject x="0" y="0" 
                    width={1920} 
                    height={1080}
                    style={{ overflow: 'visible', zIndex: 99999 }}
                    >
                    <motion.div
                        data-testid={`ghost${props.ghost.key}`}
                        key={props.ghost.key}
                        style={{
                            offsetPath: `path("${props.path}")`,
                            zIndex: getZIndexValues().ghostVehicle - props.ghost.racePosition
                        }}
                        className={props.keepClosed ? "minimap-ghost-container" :"ghost"}
                        initial={{ offsetDistance: "0%"}}
                        animate={animationControls}
                    >
                        <div style={{ transform: `scaleX(${ratio})` }}>
                            <LapCompletedText 
                                lapsCompleted={props.ghost.lapsCompleted}/>
                        </div>
                        <div className="minimap-ghost rounded-circle" style={{
                            borderColor: getColorForRaceLap(props.ghost.lapsCompleted),
                            borderWidth: "3px",
                            borderStyle: "solid",
                            backgroundColor: getColorForStudy(props.ghost.study).mainColor,
                            width: `calc(${DESIRED_MINIMAP_SIZE} * ${scaleX})`,
                            height: `calc(${DESIRED_MINIMAP_SIZE} * ${scaleY} * ${ratio})`
                        }}></div>
                    </motion.div>
                </foreignObject>
            </svg>
            }
        </div>
    )
}

export default GhostVehicle