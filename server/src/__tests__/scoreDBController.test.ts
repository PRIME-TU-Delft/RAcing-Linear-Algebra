import { getAllScores, getCheckpoints, saveNewScore } from "../controllers/scoreDBController"
import { Score } from "../models/scoreModel"

describe("scoreDBController tests", () => {
    test("should create a new score with the given parameters", async () => {
        const mockScore = {
            teamname: "Team A",
            score: 100,
            checkpoints: [1, 2, 3],
            roundId: "round123",
            study: "CSE",
            accuracy: 0.8,
        }

        jest.spyOn(Score, "create").mockResolvedValueOnce(mockScore as any)

        const teamname = "Team A"
        const score = 100
        const checkpoints = [1, 2, 3]
        const roundId = "round123"
        const study = "CSE"
        const accuracy = 0.8

        await saveNewScore(teamname, score, checkpoints, roundId, study, accuracy)

        expect(Score.create).toHaveBeenCalledTimes(1)
    })

    test("getAllScores returns correctly", async () => {
        const mockScore = [
            {
                teamname: "team1",
                score: 10,
                checkpoints: [1, 2, 3],
                roundId: "123",
                study: "CSE",
                accuracy: 0.5,
            },
            {
                teamname: "team2",
                score: 100,
                checkpoints: [1, 2, 3],
                roundId: "124",
                study: "CSE",
                accuracy: 0.6,
            },
        ]

        jest.spyOn(Score, "find").mockResolvedValueOnce(mockScore)

        const results = await getAllScores("123")
        expect(results).not.toBeUndefined()
        if (results) {
            expect(results[0]).toEqual(mockScore[0])
            expect(results[1]).toEqual(mockScore[1])
        }
    })

    test("getCheckpoints returns correctly", async () => {
        const mockScore = [
            {
                teamname: "team1",
                score: 10,
                checkpoints: [1, 2, 3],
                roundId: "123",
                study: "CSE",
                accuracy: 0.5,
            },
            {
                teamname: "team2",
                score: 100,
                checkpoints: [1, 2, 3],
                roundId: "123",
                study: "CSE",
                accuracy: 0.6,
            },
        ]

        jest.spyOn(Score, "find").mockResolvedValueOnce(mockScore)
        const results = await getCheckpoints("123", 1)
        expect(results).toEqual([
            ["team1", 2],
            ["team2", 2],
        ])
    })
})
