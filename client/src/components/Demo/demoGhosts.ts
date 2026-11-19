import { ServerGhost } from "../RaceThemes/SharedUtils"

/**
 * In the real game, ghost teams are recordings of how earlier classes scored over time on the same topic.
 * The demo has no database, so it simulates a handful of such recordings.
 */

const GHOST_TEAMS: { teamName: string; study: string; finalScoreFactor: number }[] = [
    { teamName: "CSE 2024", study: "cse", finalScoreFactor: 0.35 },
    { teamName: "AE 2024", study: "ae", finalScoreFactor: 0.6 },
    { teamName: "MCH 2025", study: "mch", finalScoreFactor: 0.85 },
    { teamName: "EE 2025", study: "ee", finalScoreFactor: 1.1 },
    { teamName: "AM 2025", study: "am", finalScoreFactor: 1.45 },
]

/**
 * Generates cumulative, non-decreasing score recordings for each ghost team.
 * @param roundDuration round length in seconds
 * @param lapScore points needed for one full lap; final ghost scores are expressed relative to it
 */
export function generateDemoGhosts(roundDuration: number, lapScore: number): ServerGhost[] {
    return GHOST_TEAMS.map((team) => {
        const finalScore = Math.round(team.finalScoreFactor * lapScore * (0.9 + Math.random() * 0.2))

        // A score update every 6-14 seconds, like a class where answers trickle in
        const timePoints: number[] = []
        let t = 4 + Math.random() * 6
        while (t < roundDuration - 2) {
            timePoints.push(Math.floor(t))
            t += 6 + Math.random() * 8
        }
        timePoints.push(roundDuration - 1)

        // Random positive increments, normalized so the last recording hits the final score
        const increments = timePoints.map(() => 0.4 + Math.random())
        const total = increments.reduce((a, b) => a + b, 0)
        let cumulative = 0
        const timeScores = timePoints.map((timePoint, i) => {
            cumulative += increments[i]
            return { timePoint, score: Math.round((cumulative / total) * finalScore) }
        })

        return {
            teamName: team.teamName,
            timeScores,
            checkpoints: [],
            study: team.study,
            accuracy: Math.round(55 + Math.random() * 35),
        }
    })
}
