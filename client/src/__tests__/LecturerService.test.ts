/**
 * Characterisation tests for LecturerService (see REFACTORING_PLAN.md step 0.4).
 */
import LecturerService, { IScore } from "../components/CreateGame/Lecturer/LecturerService"

const { transformCheckpointData, formatTeamScores, formatTime, getCheckpointsForTheme } =
    LecturerService

describe("formatTime", () => {
    test.each([
        [0, "00:00"],
        [5, "00:05"],
        [65, "01:05"],
        [599, "09:59"],
        [600, "10:00"],
    ])("%d seconds -> %s", (seconds, text) => {
        expect(formatTime(seconds)).toBe(text)
    })

    test.each([
        [605, "10:00"],
        [659, "10:00"],
        [3601, "60:00"],
    ])("BUG (Appendix B #13): %d seconds -> %s (seconds dropped from 10 minutes on)", (seconds, text) => {
        expect(formatTime(seconds)).toBe(text)
    })
})

describe("transformCheckpointData", () => {
    test("splits seconds into minutes and seconds per team", () => {
        expect(
            transformCheckpointData([
                ["Alpha", 125],
                ["Beta", 59],
                ["Gamma", 600],
            ])
        ).toEqual([
            { teamName: "Alpha", teamMinutes: 2, teamSeconds: 5 },
            { teamName: "Beta", teamMinutes: 0, teamSeconds: 59 },
            { teamName: "Gamma", teamMinutes: 10, teamSeconds: 0 },
        ])
    })
})

describe("formatTeamScores", () => {
    const score = (teamname: string, value: number, accuracy: number): IScore => ({
        teamname,
        score: value,
        accuracy,
        checkpoints: [],
        roundId: "round",
        study: "cse",
    })

    test("returns teams sorted by score, highest first, with an empty checkpoint", () => {
        const scores = [score("Low", 10, 50), score("High", 90, 75), score("Mid", 40, 60)]

        expect(formatTeamScores(scores, "Train")).toEqual([
            { name: "High", score: 90, accuracy: 75, checkpoint: "" },
            { name: "Mid", score: 40, accuracy: 60, checkpoint: "" },
            { name: "Low", score: 10, accuracy: 50, checkpoint: "" },
        ])
    })

    test("BUG (Appendix B #35): sorts the caller's array in place", () => {
        const scores = [score("Low", 10, 50), score("High", 90, 75)]

        formatTeamScores(scores, "Train")

        expect(scores.map((s) => s.teamname)).toEqual(["High", "Low"])
    })
})

describe("getCheckpointsForTheme", () => {
    test("boat has three islands", () => {
        expect(getCheckpointsForTheme("Boat").map((c) => c.name)).toEqual([
            "Solitude Island",
            "Mystic Isle",
            "Hidden Oasis",
        ])
    })

    test.each(["Train", "train", "unknown"])("%s has no checkpoints", (theme) => {
        expect(getCheckpointsForTheme(theme)).toEqual([])
    })
})
