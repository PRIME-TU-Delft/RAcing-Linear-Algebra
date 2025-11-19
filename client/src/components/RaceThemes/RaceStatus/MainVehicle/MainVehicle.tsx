import { clamp, motion, useAnimationControls } from "framer-motion";
import React, { useContext, useEffect, useState } from "react";
import VehicleImage from "../../VehicleImage/VehicleImage";
import { formatRacePositionText, getColorForRaceLap, getZIndexValues } from "../../RaceService";
import { RacePathContext } from "../../../../contexts/RacePathContext";
import { RaceDataContext } from "../../../../contexts/RaceDataContext";
import { ScoreContext } from "../../../../contexts/ScoreContext";
import zIndex from "@mui/material/styles/zIndex";
import { getRacePathSizeAndOffsetMargins } from "../../../Game/GameService";

interface Props {
    racePosition: number
    progressPercent: number
    path: string
    isOnMinimap: boolean
}

function MainVehicle(props: Props) {
    const raceData = useContext(RaceDataContext)
    const scores = useContext(ScoreContext)
    const [currentProgress, setCurrentProgress] = useState(0)

    const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    });

    const [racePathSizing, setRacePathSizing] = useState(getRacePathSizeAndOffsetMargins(dimensions.width, dimensions.height));
    const DESIRED_SIZE = "3vw";
    const desiredMinimapSize = "2.5vw"
    const FONT_SIZE = "1vw";
    const scaleX = 1920 / (props.isOnMinimap ? racePathSizing.width : dimensions.width);
    const scaleY = 1080 / (props.isOnMinimap ? racePathSizing.height : dimensions.height);
    const [ratio, setRatio] = useState(scaleX / scaleY);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setDimensions({ width, height });
            setRacePathSizing(getRacePathSizeAndOffsetMargins(width, height));

            const newScaleX = 1920 / (props.isOnMinimap ? racePathSizing.width : width);
            const newScaleY = 1080 / (props.isOnMinimap ? racePathSizing.height : height);
            setRatio(newScaleX / newScaleY);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        setRacePathSizing(getRacePathSizeAndOffsetMargins(dimensions.width, dimensions.height));
    }, [dimensions]);
    
    const getNumberOfRaceLapsCompleted = (totalPoints: number, currentPoints: number) => {
        return Math.floor(currentPoints / totalPoints)
    }
    const animationControls = useAnimationControls()

    useEffect(() => {
        playAnimation()
    }, [props.progressPercent])

    const playAnimation = () => {
        // Since the team can't move backwards, if the new progress value is smaller than the old, it means we are in a new race lap
        if (props.progressPercent < currentProgress) {
            animationControls.start({   // First, complete the lap
                offsetDistance: "100%",
                transition: { duration: 1.5 }
            }).then((val) => {
                animationControls.set({   // Then, reset the progress to 0 so it doesn't travel from 100 backwards
                    offsetDistance: "0%",
                    transition: { delay: 1000 }
                })
            }).then((val) => {
                animationControls.start({   // Finally, play the animation leading to the new progress value
                    offsetDistance: (props.progressPercent * 100).toString() + "%",
                    transition: { duration: 1, delay: 0.5 }
                })
                setCurrentProgress(curr => props.progressPercent)
            })
        }
        else {
            animationControls.start({   // Else, just update the progress normally
                offsetDistance: (props.progressPercent * 100).toString() + "%",
                transition: { duration: 1.5 }
            })
            setCurrentProgress(curr => props.progressPercent)
        }
    }

    console.log(dimensions.width)

    return(
        <div>
            {/* Displays the main vehicle, representing the team currently playing */}
            {raceData.theme == "Train" && <motion.div
                data-testid={"main-vehicle"}
                className="main-vehicle"
                style={{ 
                    offsetPath: `path("${props.path}")`,
                    zIndex: 999999
                }}
                initial={{ offsetDistance: "0%"}}
                animate={animationControls}
                transition={{
                    ease: "easeInOut",
                    duration: 2,
                    stiffness: 100,
                }}
            >
                <div className={props.isOnMinimap ? "minimap-main-vehicle-text" : "main-vehicle-position-number main-vehicle-text"} style={{zIndex: getZIndexValues().mainVehicle + 20}}>{formatRacePositionText(props.racePosition + 1)}</div>
                <div className={props.isOnMinimap ? "minimap-vehicle-image-container rounded-circle" : "vehicle-image-container rounded-circle"} style={
                    { 
                        borderColor: getColorForRaceLap(getNumberOfRaceLapsCompleted(scores.totalPoints, scores.currentPoints)),
                    }}>
                    <VehicleImage 
                        theme={raceData.theme} 
                        colors={{
                            mainColor: "#0021A7",
                            highlightColor: "#F8B700"
                        }} />
                </div>
            </motion.div>}

            {raceData.theme == "Boat" && !props.isOnMinimap &&
            <svg className="svg-path" viewBox="0 0 1920 1080" preserveAspectRatio="none">
                <path
                    d={props.path}
                    fill={"none"}
                    strokeWidth={2}
                    strokeDasharray={"15"}
                    stroke={"#3d6fadff"}
                />
                <foreignObject x="0" y="0" 
                    width={1920} 
                    height={1080}
                    style={{ overflow: 'visible' }}
                    >
                     <motion.div
                        data-testid={"main-vehicle"}
                        className="main-vehicle"
                        style={{ 
                            offsetPath: `path("${props.path}")`,
                            zIndex: 999999
                        }}
                        initial={{ offsetDistance: "0%"}}
                        animate={animationControls}
                        transition={{
                            ease: "easeInOut",
                            duration: 2,
                            stiffness: 100,
                        }}
                    >
                        <div className={props.isOnMinimap ? "minimap-main-vehicle-text" : "main-vehicle-position-number main-vehicle-text"} style={
                            {
                                zIndex: getZIndexValues().mainVehicle + 20,
                                // marginTop: `${distinctHeight / 1.5}px`,
                                // marginLeft: `${distinctWidth / 1.5}px`,
                                fontSize: `calc(${FONT_SIZE} * ${scaleY})`
                            }}>{formatRacePositionText(props.racePosition + 1)}</div>
                        <div className={props.isOnMinimap ? "minimap-vehicle-image-container rounded-circle" : "vehicle-image-container rounded-circle"} style={
                            { 
                                borderColor: getColorForRaceLap(getNumberOfRaceLapsCompleted(scores.totalPoints, scores.currentPoints)),
                                width: `calc(${DESIRED_SIZE} * ${ratio * scaleX})`,
                                height: `calc(${DESIRED_SIZE} * ${ratio * scaleY})`

                            }}>
                            <VehicleImage 
                                theme={raceData.theme} 
                                colors={{
                                    mainColor: "#0021A7",
                                    highlightColor: "#F8B700"
                                }} />
                        </div>
                    </motion.div>
                </foreignObject>
            </svg>
            }

            {raceData.theme == "Boat" && props.isOnMinimap &&
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
                        data-testid={"main-vehicle"}
                        className="main-vehicle"
                        style={{ 
                            offsetPath: `path("${props.path}")`,
                            zIndex: 999999
                        }}
                        initial={{ offsetDistance: "0%"}}
                        animate={animationControls}
                        transition={{
                            ease: "easeInOut",
                            duration: 2,
                            stiffness: 100,
                        }}
                    >
                        <div className={props.isOnMinimap ? "minimap-main-vehicle-text" : "main-vehicle-position-number main-vehicle-text"} style={
                            {
                                zIndex: getZIndexValues().mainVehicle + 20,
                                marginTop: `calc(-${desiredMinimapSize})`,
                                marginLeft: `calc(${desiredMinimapSize} * 2)`,
                                fontSize: `calc(${FONT_SIZE} * ${scaleY})`
                            }}>{formatRacePositionText(props.racePosition + 1)}</div>
                        <div className={props.isOnMinimap ? "minimap-vehicle-image-container rounded-circle" : "vehicle-image-container rounded-circle"} style={
                            { 
                                borderColor: getColorForRaceLap(getNumberOfRaceLapsCompleted(scores.totalPoints, scores.currentPoints)),
                                width: `calc(${desiredMinimapSize} * ${scaleX})`,
                                height: `calc(${desiredMinimapSize} * ${scaleY})`,
                                offsetAnchor: 'center center',
                            }}>
                            <VehicleImage 
                                theme={raceData.theme} 
                                colors={{
                                    mainColor: "#0021A7",
                                    highlightColor: "#F8B700"
                                }} />
                        </div>
                    </motion.div>
                </foreignObject>
            </svg>
            }
        </div>
    )
}

export default MainVehicle