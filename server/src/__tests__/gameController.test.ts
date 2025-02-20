import { Game } from "../objects/gameObject"
import {
    addGame,
    getGame,
    removeGame,
    endRound,
    clearGames,
    games,
} from "../controllers/gameController"

const sinon = require("sinon")
sinon.stub(Math, "random").returns(0.4)

describe("Game functionality testing", () => {
    let irounds
    let socketIds

    beforeEach(() => {
        irounds = []
        socketIds = ["hi", "hi2"]
    })

    it("Add game", () => {
        addGame(irounds, [], "team123", socketIds, 123, "CSE")
        expect(games.size).toBe(1)
    })

    it("Remove game", () => {
        addGame(irounds, [],"team456", socketIds, 456, "CSE")
        expect(games.size).toBe(1)
        removeGame(456)
        expect(games.size).toBe(0)
    })

    it("Get game", () => {
        addGame(irounds, [],"team789", socketIds, 789, "CSE")
        expect(games.size).toBe(1)

        const game = getGame(789)
        expect(game instanceof Game)
    })

    it("Get game game undefined", () => {
        addGame(irounds, [],"team789", socketIds, 789, "CSE")
        expect(games.size).toBe(1)

        expect(() => {
            getGame(732)
        }).toThrow(new Error("No such game"))
    })

    it("End round", () => {
        addGame(irounds, [],"team234", socketIds, 234, "AE")
        expect(games.size).toBe(1)
        const game = getGame(234)
        game.avgScore = 50
        game.totalScore = 100
        game.currentTopicIndex = 2
        game.checkpoints = [1, 2, 3]
        game.correct = 15
        game.incorrect = 5
        endRound(234)
        expect(game.avgScore == 0)
        expect(game.totalScore == 0)
        expect(game.currentTopicIndex == 3)
        expect(game.checkpoints.length == 0)
        expect(game.correct == 0)
        expect(game.incorrect == 0)
    })

    it("End round game undefined", () => {
        addGame(irounds, [],"team234", socketIds, 234, "AE")
        expect(games.size).toBe(1)
        const game = getGame(234)
        game.avgScore = 50
        game.totalScore = 100
        game.currentTopicIndex = 2
        game.checkpoints = [1, 2, 3]
        game.correct = 15
        game.incorrect = 5

        expect(() => {
            endRound(732)
        }).toThrow(new Error("No such game"))
    })

    afterEach(() => {
        clearGames()
    })
})
