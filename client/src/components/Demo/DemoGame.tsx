import React, { useEffect, useMemo, useState } from "react"
import "../Game/Game.css"
import "./Demo.css"
import TimeBar from "../Game/TimeBar/TimeBar"
import DifficultySelection from "../Questions/DifficultySelection/DifficultySelection"
import QuestionTrainBackground from "../Questions/Themes/QuestionTrainBackground"
import QuestionBoatBackground from "../Questions/Themes/QuestionBoatBackground"
import RaceStatus from "../RaceThemes/RaceStatus/RaceStatus"
import RaceTheme from "../RaceThemes/RaceTheme"
import ColorationInfo from "../ColorationInfo/ColorationInfo"
import { getRacePathObject, formatRacePositionText } from "../RaceThemes/RaceService"
import { getMinimapPathColorForTheme, getRacePathSizeAndOffsetMargins } from "../Game/GameService"
import { initializeFrontendGhostObjects } from "../RaceThemes/Ghosts/GhostService"
import { Ghost, Streak } from "../RaceThemes/SharedUtils"
import { trainMaps } from "../RaceThemes/Maps/TrainMaps"
import { boatMaps } from "../RaceThemes/Maps/BoatMaps"
import { RaceDataContext } from "../../contexts/RaceDataContext"
import { ScoreContext } from "../../contexts/ScoreContext"
import { TimeContext } from "../../contexts/TimeContext"
import { RacePathContext } from "../../contexts/RacePathContext"
import { StreakContext } from "../../contexts/StreakContext"
import { DifficultyAvailabilityContext } from "../../contexts/DifficultyAvailabilityContext"
import DemoQuestionCard from "./DemoQuestionCard"
import { DemoDifficulty, DemoQuestion, DIFFICULTY_SETTINGS, generateMandatoryQuestion, generateQuestion } from "./demoQuestions"
import { generateDemoGhosts } from "./demoGhosts"

export interface DemoResult {
    score: number
    lapScore: number
    correct: number
    attempted: number
    bestStreak: number
    perDifficulty: Record<DemoDifficulty, { correct: number; attempted: number }>
    ranking: { name: string; score: number; isPlayer: boolean }[]
}

interface Props {
    teamName: string
    theme: "Train" | "Boat"
    roundDuration: number
    lapScore: number
    onFinished: (result: DemoResult) => void
    onQuit: () => void
}

type Phase = "countdown" | "question" | "choosing"

const STREAK_TYPES = ["easy", "medium", "hard"]

/** Score of a ghost team at a given moment, based on its recorded time scores */
function ghostScoreAt(ghost: Ghost, usedTime: number) {
    let score = 0
    for (const ts of ghost.timeScores) {
        if (ts.timePoint <= usedTime) score = ts.score
        else break
    }
    return score
}

function useWindowSize() {
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
    useEffect(() => {
        const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [])
    return size
}

function DemoGame(props: Props) {
    const { width, height } = useWindowSize()
    const selectedMap = props.theme === "Boat" ? boatMaps[0] : trainMaps[1]

    // Ghost objects are mutated by the race components, so they are created once per game
    const [ghostTeams] = useState<Ghost[]>(() =>
        initializeFrontendGhostObjects(generateDemoGhosts(props.roundDuration, props.lapScore))
    )

    const [phase, setPhase] = useState<Phase>("countdown")
    const [countdown, setCountdown] = useState(3)
    const [remainingTime, setRemainingTime] = useState(props.roundDuration)
    const [score, setScore] = useState(0)
    const [question, setQuestion] = useState<DemoQuestion>(() => generateMandatoryQuestion())
    const [questionNumber, setQuestionNumber] = useState(1)
    const [isFirstChoice, setIsFirstChoice] = useState(true)
    const [streaks, setStreaks] = useState<Streak[]>(
        STREAK_TYPES.map((type) => ({ questionType: type, streakValue: 0, streakMultiplier: 1 }))
    )
    const [bestStreak, setBestStreak] = useState(0)
    const [stats, setStats] = useState<DemoResult["perDifficulty"]>({
        mandatory: { correct: 0, attempted: 0 },
        easy: { correct: 0, attempted: 0 },
        medium: { correct: 0, attempted: 0 },
        hard: { correct: 0, attempted: 0 },
    })
    const [showLecturerView, setShowLecturerView] = useState(false)

    const usedTime = props.roundDuration - remainingTime

    // 3-2-1 countdown before the round starts
    useEffect(() => {
        if (phase !== "countdown") return
        if (countdown <= 0) {
            setPhase("question")
            return
        }
        const timeout = setTimeout(() => setCountdown((c) => c - 1), 900)
        return () => clearTimeout(timeout)
    }, [phase, countdown])

    // Round timer
    useEffect(() => {
        if (phase === "countdown") return
        if (remainingTime <= 0) {
            finishRound()
            return
        }
        const timeout = setTimeout(() => setRemainingTime((t) => t - 1), 1000)
        return () => clearTimeout(timeout)
    }, [phase, remainingTime])

    // Keyboard shortcut to toggle the lecture-hall view
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return
            if (e.key.toLowerCase() === "l") setShowLecturerView((v) => !v)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    const getMultiplier = (difficulty: DemoDifficulty) =>
        streaks.find((s) => s.questionType === difficulty)?.streakMultiplier ?? 1

    // Fixed when the question is handed out, so the shown value doesn't change when the streak updates
    const [pointsToGain, setPointsToGain] = useState(DIFFICULTY_SETTINGS.mandatory.basePoints)

    const finishRound = () => {
        const ranking = [
            { name: props.teamName, score, isPlayer: true },
            ...ghostTeams.map((g) => ({
                name: g.teamName,
                score: g.timeScores[g.timeScores.length - 1]?.score ?? 0,
                isPlayer: false,
            })),
        ].sort((a, b) => b.score - a.score)

        const correct = Object.values(stats).reduce((a, s) => a + s.correct, 0)
        const attempted = Object.values(stats).reduce((a, s) => a + s.attempted, 0)

        props.onFinished({
            score,
            lapScore: props.lapScore,
            correct,
            attempted,
            bestStreak,
            perDifficulty: stats,
            ranking,
        })
    }

    const questionOutcomeHandler = (correct: boolean) => {
        const difficulty = question.difficulty
        setStats((curr) => ({
            ...curr,
            [difficulty]: {
                correct: curr[difficulty].correct + (correct ? 1 : 0),
                attempted: curr[difficulty].attempted + 1,
            },
        }))

        if (correct) setScore((s) => s + pointsToGain)

        // Streaks are tracked per difficulty, each correct answer adds 0.1x up to 1.5x (same rules as the real game)
        if (difficulty !== "mandatory") {
            const newStreaks = streaks.map((s) => {
                if (s.questionType !== difficulty) return s
                if (!correct) return { ...s, streakValue: 0, streakMultiplier: 1 }
                const streakValue = s.streakValue + 1
                return { ...s, streakValue, streakMultiplier: Math.min(1 + streakValue / 10, 1.5) }
            })
            setStreaks(newStreaks)
            setBestStreak((b) => Math.max(b, ...newStreaks.map((s) => s.streakValue)))
        }
    }

    const difficultyChosenHandler = (difficulty: string) => {
        const d = difficulty as "easy" | "medium" | "hard"
        setQuestion(generateQuestion(d))
        setPointsToGain(Math.floor(DIFFICULTY_SETTINGS[d].basePoints * getMultiplier(d)))
        setQuestionNumber((n) => n + 1)
        setIsFirstChoice(false)
        setPhase("question")
    }

    // Live race position against the ghost teams (ties rank behind, matching the label on the race track)
    const position = 1 + ghostTeams.filter((g) => ghostScoreAt(g, usedTime) >= score).length

    const racePathSizing = getRacePathSizeAndOffsetMargins(width, height)
    const racePath = useMemo(
        () => getRacePathObject(selectedMap, racePathSizing.width, racePathSizing.height),
        [selectedMap, width, height]
    )

    const raceData = { theme: props.theme, ghostTeams, checkpoints: [], selectedMap }
    const scoreData = {
        currentPoints: score,
        totalPoints: props.lapScore,
        teamAveragePoints: score,
        currentAccuracy: 100,
    }

    return (
        <RaceDataContext.Provider value={raceData}>
            <ScoreContext.Provider value={scoreData}>
                <TimeContext.Provider value={remainingTime}>
                    <StreakContext.Provider value={streaks}>
                        <DifficultyAvailabilityContext.Provider value={{ easy: true, medium: true, hard: true }}>
                            {props.theme === "Train" ? <QuestionTrainBackground /> : <QuestionBoatBackground />}

                            <div className="demo-topbar">
                                <div className="demo-topbar-team">
                                    <span className="demo-badge">DEMO</span> {props.teamName}
                                </div>
                                <div className="demo-topbar-actions">
                                    <button className="demo-topbar-btn" onClick={() => setShowLecturerView(true)}>
                                        📽 Lecture-hall screen
                                    </button>
                                    <button className="demo-topbar-btn demo-topbar-quit" onClick={props.onQuit}>
                                        ✕ Quit
                                    </button>
                                </div>
                            </div>

                            <div className="game-container demo-game-container">
                                <div className="game-left-container">
                                    <TimeBar roundDuration={props.roundDuration} />
                                    <div className="demo-question-area">
                                        <DifficultySelection
                                            open={phase === "choosing"}
                                            showDescription={isFirstChoice}
                                            type=""
                                            easyIsOnCooldown={false}
                                            onDifficultySelected={() => undefined}
                                            onDifficultyChosen={difficultyChosenHandler}
                                        />
                                        {phase === "question" && (
                                            <DemoQuestionCard
                                                question={question}
                                                questionNumber={questionNumber}
                                                pointsToGain={pointsToGain}
                                                onOutcome={questionOutcomeHandler}
                                                onContinue={() => setPhase("choosing")}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="game-right-container">
                                    <div className="demo-stats">
                                        <div className="demo-stat">
                                            <div className="demo-stat-label">Points</div>
                                            <div className="demo-stat-value">{score}</div>
                                        </div>
                                        <div className="demo-stat">
                                            <div className="demo-stat-label">Position</div>
                                            <div className="demo-stat-value">
                                                {formatRacePositionText(position)}
                                                <span className="demo-stat-sub"> / {ghostTeams.length + 1}</span>
                                            </div>
                                        </div>
                                        <div className="demo-stat">
                                            <div className="demo-stat-label">Lap</div>
                                            <div className="demo-stat-value">{Math.floor(score / props.lapScore) + 1}</div>
                                        </div>
                                    </div>
                                    <div className="demo-ghost-hint">
                                        The other vehicles are <b>ghost teams</b>: replays of how earlier classes did on this topic.
                                    </div>
                                    <div className="coloration-information-element">
                                        <ColorationInfo />
                                    </div>
                                </div>
                            </div>

                            {!showLecturerView && (
                                <RacePathContext.Provider value={racePath}>
                                    <div className="race-minimap-container">
                                        <div
                                            className="race-status-container"
                                            style={{
                                                width: racePathSizing.width,
                                                height: racePathSizing.height,
                                                marginLeft: racePathSizing.offsetX,
                                                marginTop: racePathSizing.offsetY,
                                            }}
                                        >
                                            <RaceStatus keepClosed={true} roundDuration={props.roundDuration} />
                                        </div>
                                        <svg
                                            className="minimap-svg-path"
                                            viewBox={props.theme === "Boat" ? "0 0 1920 1080" : undefined}
                                            preserveAspectRatio={props.theme === "Boat" ? "xMidYMid meet" : undefined}
                                            style={{
                                                width: racePathSizing.width,
                                                height: racePathSizing.height,
                                                marginLeft: racePathSizing.offsetX,
                                                marginTop: racePathSizing.offsetY,
                                            }}
                                        >
                                            <path
                                                d={racePath.svgPath}
                                                fill="none"
                                                strokeWidth={10}
                                                stroke={getMinimapPathColorForTheme(props.theme)}
                                                vectorEffect="non-scaling-stroke"
                                            />
                                        </svg>
                                    </div>
                                </RacePathContext.Provider>
                            )}

                            {showLecturerView && (
                                <div className="demo-lecturer-view">
                                    <div className="demo-lecturer-header">
                                        <div>
                                            <div className="demo-lecturer-title">What the class sees on the projector</div>
                                            <div className="demo-lecturer-sub">
                                                Students play on their own devices; all their points move the class's{" "}
                                                {props.theme === "Boat" ? "boat" : "train"}.
                                            </div>
                                        </div>
                                        <div className="demo-lecturer-numbers">
                                            <span>
                                                ⏱ {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, "0")}
                                            </span>
                                            <span>Score: {score}</span>
                                            <span>{formatRacePositionText(position)} place</span>
                                        </div>
                                        <button className="demo-topbar-btn" onClick={() => setShowLecturerView(false)}>
                                            ⬅ Back to my questions
                                        </button>
                                    </div>
                                    <div className="demo-lecturer-map" style={{ height: height - 90 }}>
                                        <RaceTheme
                                            mapDimensions={{ width: width, height: height - 90 }}
                                            setCheckpoint={() => undefined}
                                            showCheckPoint={() => undefined}
                                            roundDuration={props.roundDuration}
                                        />
                                    </div>
                                </div>
                            )}

                            {phase === "countdown" && (
                                <div className="demo-countdown-overlay">
                                    <div className="demo-countdown-number" key={countdown}>
                                        {countdown > 0 ? countdown : "GO!"}
                                    </div>
                                </div>
                            )}
                        </DifficultyAvailabilityContext.Provider>
                    </StreakContext.Provider>
                </TimeContext.Provider>
            </ScoreContext.Provider>
        </RaceDataContext.Provider>
    )
}

export default DemoGame
