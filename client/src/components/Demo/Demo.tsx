import React, { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import "./Demo.css"
import DemoGame, { DemoResult } from "./DemoGame"
import { formatRacePositionText } from "../RaceThemes/RaceService"
import TrainIcon from "../../img/icons/train-medium.png"
import BoatIcon from "../../img/maps/boat/main-boat.png"

/**
 * Offline, single-laptop demo of Racing LAB for conferences and open days.
 *
 * Runs entirely in the browser: no server, no database and no Grasple connection are needed.
 * Open /demo to use it. Optional query parameters: ?duration=<seconds>&lap=<points>
 */

const TEAM_NAMES = [
    "Team Eigen",
    "The Determinators",
    "Span-tastic",
    "Kernel Panic",
    "Row Reducers",
    "The Orthonormals",
    "Basis Jumpers",
    "Null Space Cadets",
]

const RESULTS_AUTO_RESET_SECONDS = 60

type Screen = "intro" | "playing" | "results"

function Demo() {
    const [searchParams] = useSearchParams()
    const roundDuration = Math.max(20, parseInt(searchParams.get("duration") ?? "") || 120)
    const lapScore = Math.max(50, parseInt(searchParams.get("lap") ?? "") || 300)

    const [screen, setScreen] = useState<Screen>("intro")
    const [teamName, setTeamName] = useState(() => TEAM_NAMES[Math.floor(Math.random() * TEAM_NAMES.length)])
    const [theme, setTheme] = useState<"Train" | "Boat">("Train")
    const [result, setResult] = useState<DemoResult | null>(null)
    const [gameKey, setGameKey] = useState(0)

    const start = () => {
        setGameKey((k) => k + 1)
        setScreen("playing")
    }

    const backToIntro = () => {
        setTeamName(TEAM_NAMES[Math.floor(Math.random() * TEAM_NAMES.length)])
        setResult(null)
        setScreen("intro")
    }

    if (screen === "playing") {
        return (
            <DemoGame
                key={gameKey}
                teamName={teamName.trim() || "Demo Team"}
                theme={theme}
                roundDuration={roundDuration}
                lapScore={lapScore}
                onFinished={(r) => {
                    setResult(r)
                    setScreen("results")
                }}
                onQuit={backToIntro}
            />
        )
    }

    if (screen === "results" && result) {
        return <DemoResults result={result} onPlayAgain={start} onDone={backToIntro} />
    }

    return (
        <DemoIntro
            teamName={teamName}
            onTeamNameChange={setTeamName}
            theme={theme}
            onThemeChange={setTheme}
            roundDuration={roundDuration}
            onStart={start}
        />
    )
}

function FullscreenButton() {
    const toggle = () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
        else document.documentElement.requestFullscreen().catch(() => undefined)
    }
    return (
        <button className="demo-fullscreen-btn" onClick={toggle} title="Toggle fullscreen">
            ⛶
        </button>
    )
}

interface IntroProps {
    teamName: string
    onTeamNameChange: (name: string) => void
    theme: "Train" | "Boat"
    onThemeChange: (theme: "Train" | "Boat") => void
    roundDuration: number
    onStart: () => void
}

function DemoIntro(props: IntroProps) {
    const minutes = Math.round(props.roundDuration / 60)
    return (
        <div className="demo-screen">
            <FullscreenButton />
            <div className="demo-intro-card">
                <div className="demo-title">Racing LAB</div>
                <div className="demo-subtitle">
                    Linear algebra practice as a class-wide race. Try a {minutes > 0 ? `${minutes}-minute` : "short"} round!
                </div>

                <div className="demo-steps">
                    <div className="demo-step">
                        <div className="demo-step-icon">🧮</div>
                        <div>
                            <b>Solve exercises</b>
                            <div className="demo-step-text">Every correct answer moves your vehicle forward.</div>
                        </div>
                    </div>
                    <div className="demo-step">
                        <div className="demo-step-icon">🎯</div>
                        <div>
                            <b>Pick your challenge</b>
                            <div className="demo-step-text">Harder questions earn more points. Streaks multiply them.</div>
                        </div>
                    </div>
                    <div className="demo-step">
                        <div className="demo-step-icon">👻</div>
                        <div>
                            <b>Beat earlier classes</b>
                            <div className="demo-step-text">Race against replays of how previous teams did.</div>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        props.onStart()
                    }}
                >
                    <label className="demo-label" htmlFor="demo-team-name">
                        Team name
                    </label>
                    <input
                        id="demo-team-name"
                        className="demo-name-input"
                        value={props.teamName}
                        maxLength={24}
                        onChange={(e) => props.onTeamNameChange(e.target.value)}
                    />

                    <div className="demo-label">Theme</div>
                    <div className="demo-theme-row">
                        {(["Train", "Boat"] as const).map((t) => (
                            <button
                                type="button"
                                key={t}
                                className={`demo-theme-option ${props.theme === t ? "demo-theme-selected" : ""}`}
                                onClick={() => props.onThemeChange(t)}
                            >
                                <img src={t === "Train" ? TrainIcon : BoatIcon} alt="" />
                                <span>{t}</span>
                            </button>
                        ))}
                    </div>

                    <button type="submit" className="demo-start-btn">
                        Start racing ▶
                    </button>
                </form>

                <div className="demo-footnote">
                    In class, students join from their own phones or laptops with a lobby code. This demo runs a single
                    player offline, with built-in exercises in place of the Grasple exercises lecturers pick.
                </div>
            </div>
        </div>
    )
}

interface ResultsProps {
    result: DemoResult
    onPlayAgain: () => void
    onDone: () => void
}

function DemoResults(props: ResultsProps) {
    const { result } = props
    const [secondsLeft, setSecondsLeft] = useState(RESULTS_AUTO_RESET_SECONDS)

    // Return to the start screen automatically so the laptop is ready for the next visitor
    useEffect(() => {
        if (secondsLeft <= 0) {
            props.onDone()
            return
        }
        const timeout = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
        return () => clearTimeout(timeout)
    }, [secondsLeft])

    const placement = result.ranking.findIndex((r) => r.isPlayer) + 1
    const accuracy = result.attempted > 0 ? Math.round((result.correct / result.attempted) * 100) : 0
    const laps = result.score / result.lapScore

    const headline =
        placement === 1
            ? "🏆 You beat every earlier class!"
            : placement <= 3
            ? `🥈 ${formatRacePositionText(placement)} place, on the podium!`
            : `${formatRacePositionText(placement)} place, good effort!`

    return (
        <div className="demo-screen">
            <FullscreenButton />
            <div className="demo-results-layout">
                <div className="demo-results-card">
                    <div className="demo-results-headline">{headline}</div>
                    <div className="demo-results-stats">
                        <div className="demo-stat">
                            <div className="demo-stat-label">Points</div>
                            <div className="demo-stat-value">{result.score}</div>
                        </div>
                        <div className="demo-stat">
                            <div className="demo-stat-label">Correct</div>
                            <div className="demo-stat-value">
                                {result.correct}/{result.attempted}
                            </div>
                        </div>
                        <div className="demo-stat">
                            <div className="demo-stat-label">Accuracy</div>
                            <div className="demo-stat-value">{accuracy}%</div>
                        </div>
                        <div className="demo-stat">
                            <div className="demo-stat-label">Best streak</div>
                            <div className="demo-stat-value">{result.bestStreak}</div>
                        </div>
                    </div>
                    <div className="demo-results-laps">
                        {laps >= 1 ? `You completed ${Math.floor(laps)} full lap${laps >= 2 ? "s" : ""}!` : `You made it ${Math.round(laps * 100)}% around the track.`}
                    </div>

                    <div className="demo-leaderboard">
                        {result.ranking.map((r, i) => (
                            <div key={r.name} className={`demo-leaderboard-row ${r.isPlayer ? "demo-leaderboard-player" : ""}`}>
                                <span className="demo-leaderboard-pos">{formatRacePositionText(i + 1)}</span>
                                <span className="demo-leaderboard-name">
                                    {r.name}
                                    {!r.isPlayer && <span className="demo-ghost-tag">ghost</span>}
                                </span>
                                <span className="demo-leaderboard-score">{r.score}</span>
                            </div>
                        ))}
                    </div>

                    <div className="demo-results-buttons">
                        <button className="demo-start-btn" onClick={props.onPlayAgain}>
                            Play again ↻
                        </button>
                        <button className="demo-secondary-btn" onClick={props.onDone}>
                            Next player
                        </button>
                    </div>
                    <div className="demo-footnote">Returning to the start screen in {secondsLeft}s</div>
                </div>

                <div className="demo-lecturer-card">
                    <div className="demo-lecturer-card-title">In your lecture</div>
                    <ul>
                        <li>
                            <b>Your exercises:</b> pick any Grasple exercises per topic, with mandatory warm-ups and
                            easy / medium / hard pools.
                        </li>
                        <li>
                            <b>Whole class, one team:</b> students join with a lobby code on their own devices; every
                            correct answer moves the class's vehicle on the projector.
                        </li>
                        <li>
                            <b>Ghost teams:</b> each class races replays of earlier classes, so there is always a
                            race to win.
                        </li>
                        <li>
                            <b>Live insight:</b> after each round you see per-question statistics, so you know what
                            to explain next.
                        </li>
                        <li>
                            <b>Fits your lecture:</b> choose the topics and the length of each round (10 minutes by
                            default).
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Demo
