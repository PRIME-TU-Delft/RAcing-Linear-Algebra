import { Statistic } from "../objects/statisticObject"

describe("Statistic tests", () => {
    test("should create a new Statistic object with the provided values", () => {
        const question = "What is the capital of France?"
        const answer = "Paris"
        const difficulty = "easy"
        const correctlyAnswered = 10
        const incorrectlyAnswered = 5

        const statistic = new Statistic(
            question,
            answer,
            difficulty,
            correctlyAnswered,
            incorrectlyAnswered
        )

        expect(statistic.question).toBe(question)
        expect(statistic.answer).toBe(answer)
        expect(statistic.difficulty).toBe(difficulty)
        expect(statistic.correctlyAnswered).toBe(correctlyAnswered)
        expect(statistic.incorrectlyAnswered).toBe(incorrectlyAnswered)
    })
})
