import React, { useContext, useEffect, useState } from "react";
import "./RaceStatus.css"
import { RaceDataContext } from "../../../contexts/RaceDataContext";
import { ScoreContext } from "../../../contexts/ScoreContext";
import { Checkpoint, RaceObject } from "../SharedUtils";
import { currentGhostIsOpen } from "../Ghosts/GhostService";
import { formatRacePositionText, getColorForRaceLap, getNewTimeScoreIndex, getZIndexValues } from "../RaceService";
import Ghosts from "../Ghosts/Ghosts";
import VehicleImage from "../VehicleImage/VehicleImage";
import { motion } from "framer-motion";
import { RacePathContext } from "../../../contexts/RacePathContext";
import MainVehicle from "./MainVehicle/MainVehicle";
import { TimeContext } from "../../../contexts/TimeContext";

interface Props {
    keepClosed: boolean
    roundDuration: number
    onCheckpointPassed?: (checkpoint: Checkpoint) => void
}

function RaceStatus(props: Props) {
    const raceData = useContext(RaceDataContext)
    const scores = useContext(ScoreContext)
    const racePath = useContext(RacePathContext)
    const remainingTime = useContext(TimeContext)

    const [progressPercent, setProgressPercent] = useState(0) // percent of team progress, initialized at 0%
    const [mainVehiclePosition, setMainVehiclePosition] = useState(0) // position of the team
    const [racingTeamStats, setRacingTeamStats] = useState<RaceObject[]>([])
    const [sortedRacingTeamStats, setSortedRacingTeamStats] = useState<RaceObject[]>([])
    const [lastCheckpointPassed, setLastCheckpointPassed] = useState<Checkpoint | null>(null)
    const [lastKnownProgress, setLastKnownProgress] = useState(0)

    useEffect(() => {
        const newRacingTeams: RaceObject[] = []

        // Adding the main train
        newRacingTeams.push({
            isGhost: false,
            score: scores.currentPoints
        })

        // Adding the ghost teams
        for (const ghost of raceData.ghostTeams) {
            const currentTimeScoreIndex = getNewTimeScoreIndex(0, ghost.timeScores, remainingTime > 0 ? props.roundDuration - remainingTime : 0)
            const previousIndex = Math.max(currentTimeScoreIndex - 1, 0)
            newRacingTeams.push({
                isGhost: true,
                ghostKey: ghost.key,
                score: ghost.timeScores[previousIndex].score ? ghost.timeScores[previousIndex].score : 0
            })
        }
        const newOrderOfTeams = [...newRacingTeams]
        newOrderOfTeams.sort((x, y) => x.score > y.score ? -1 : x.score < y.score ? 1 : 0)
        setRacingTeamStats(curr => [...newRacingTeams])
        setSortedRacingTeamStats(curr => [...newOrderOfTeams])
    }, [raceData.ghostTeams])

    useEffect(() => {
        const newOrderOfTeams = [...racingTeamStats]
        newOrderOfTeams.sort((x, y) => x.score > y.score ? -1 : x.score < y.score ? 1 : 0)
        setSortedRacingTeamStats(curr => [...newOrderOfTeams])

    }, [racingTeamStats])

    useEffect(() => {
        const newMainTeamPosition = getRacePosition()
        raceData.ghostTeams.forEach(ghost => {
            const position = getRacePosition(ghost.key)
            ghost.racePosition = position
            ghost.isOpen = currentGhostIsOpen(position, newMainTeamPosition)
        })
        setMainVehiclePosition(curr => newMainTeamPosition)
    }, [sortedRacingTeamStats])

    // Updates progress percent when points increase
    useEffect(() => {
        const newPercentage = (scores.currentPoints % scores.totalPoints) / scores.totalPoints
        setProgressPercent((current) => newPercentage)
        updateRacingStats(scores.currentPoints)
    }, [scores.currentPoints])

    useEffect(() => {
        if (!props.onCheckpointPassed || !raceData.selectedMap.checkpoints || raceData.selectedMap.checkpoints.length === 0) {
            return;
        }

        // Calculate total progress across all laps
        const lapsCompleted = Math.floor(scores.currentPoints / scores.totalPoints);
        const progressInLap = (scores.currentPoints % scores.totalPoints) / scores.totalPoints;
        const currentTotalProgress = lapsCompleted + progressInLap;

        // Find all checkpoints passed between the last known progress and current progress
        const newlyPassedCheckpoints = raceData.selectedMap.checkpoints.filter(checkpoint => {
            const checkpointTotalProgress = lapsCompleted + checkpoint.percentage;
            // Check if the checkpoint is between the last progress and current progress
            // ( handles the case where the last progress was in the same lap )
            if (checkpointTotalProgress > lastKnownProgress && checkpointTotalProgress <= currentTotalProgress) {
                return true;
            }
            // Check for checkpoints passed when completing a lap
            // e.g., last progress was 0.9, current is 1.1 (lap 1, 10%)
            const checkpointProgressInPreviousLap = (lapsCompleted - 1) + checkpoint.percentage;
            if (lapsCompleted > 0 && checkpointProgressInPreviousLap > lastKnownProgress && checkpointProgressInPreviousLap <= currentTotalProgress) {
                return true;
            }
            return false;
        });

        // If any checkpoints were passed, find the most recent one
        if (newlyPassedCheckpoints.length > 0) {
            // The most recent checkpoint is the one with the highest percentage among the newly passed ones
            const mostRecentCheckpoint = newlyPassedCheckpoints.reduce((prev, current) => 
                (prev.percentage > current.percentage) ? prev : current
            );
            props.onCheckpointPassed(mostRecentCheckpoint);
            setLastCheckpointPassed(mostRecentCheckpoint);
        }

        // Update the last known progress for the next check
        setLastKnownProgress(currentTotalProgress);

    }, [scores.currentPoints, scores.totalPoints, raceData.selectedMap.checkpoints, props.onCheckpointPassed]);


    const updateRacingStats = (newScore: number, ghostKey?: number) => {
        if (racingTeamStats.length == 0) return
        
        const newStats = [...racingTeamStats]

        let indexToUpdate = -1

        // Only ghost teams have a ghost index
        if (ghostKey != undefined) {
            indexToUpdate = newStats.findIndex(x => x.ghostKey == ghostKey)   // find element representing ghost which had a change in score
        }
        else {
            indexToUpdate = newStats.findIndex(x => !x.isGhost)   // only one team is not a ghost (playing team)
        }

        if (indexToUpdate != -1) {
            newStats[indexToUpdate].score = newScore
        }
        setRacingTeamStats(curr => [...newStats])
    }

    const getRacePosition = (ghostKey?: number) => {
        let positionIndex = -1

        if (ghostKey != undefined) {
            positionIndex = sortedRacingTeamStats.findIndex(x => x.ghostKey == ghostKey)   // using the ghost's index to find position in the race
        }
        else {
            positionIndex = sortedRacingTeamStats.findIndex(x => !x.isGhost)   // playing team is the only non-ghost in the array
        }

        return positionIndex
    }

    const getRacePositionText = (ghostKey?: number) => {
        const positionIndex = getRacePosition(ghostKey)
        if (positionIndex != -1) return formatRacePositionText(positionIndex + 1)
        else return ""
    }

    const getNumberOfRaceLapsCompleted = (totalPoints: number, currentPoints: number) => {
        return Math.floor(currentPoints / totalPoints)
    }

     useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'd' || event.key === 'D') {
                setProgressPercent(curr => curr + 0.2);
                console.log("Debug key pressed, progress increased by 20%");
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []); // Empty dependency array ensures this runs only once

    return(
        <div>
            <MainVehicle 
                racePosition={mainVehiclePosition}
                progressPercent={progressPercent}
                path={racePath.svgPath}
                isOnMinimap={props.keepClosed}
            ></MainVehicle>
            <TimeContext.Provider value={remainingTime > 0 ? props.roundDuration - remainingTime : 0}>
            <Ghosts
                    data-testid={"ghosts"}
                    path={racePath.svgPath}
                    keepClosed={props.keepClosed}
                    onGhostScoreUpdate={(newScore, ghostKey) => updateRacingStats(newScore, ghostKey)}
                />
            </TimeContext.Provider>
        </div>
    )
}

export default RaceStatus