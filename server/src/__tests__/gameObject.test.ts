import { Game } from "../objects/gameObject"
import { User } from "../objects/userObject"
import sinon from "sinon"
import mongoose from "mongoose"
import assert from "assert"

const sinon = require("sinon")
sinon.stub(Math, "random").returns(0.4)
const questionDBControllerModule = require("../controllers/questionDBController")

describe("Game", () => {
    let game: Game
    let user1: User, user2: User
    let roundStub: sinon.SinonStubbedInstance<mongoose.Document>
    let mandatoryQuestion
    let bonusQuestionEasy, bonusQuestionHard

    beforeEach(() => {
        user1 = new User()
        user2 = new User()
        const map = new Map<string, User>()
        map.set("user1", user1)
        map.set("user2", user2)

        mandatoryQuestion = { question: "What is 2 + 2", answer: "4", id: "1", type: "open" }
        bonusQuestionEasy = {
            question: "What is 1 + 1",
            answer: "2",
            id: "2",
            difficulty: "easy",
            type: "open",
        }
        bonusQuestionHard = {
            question: "What is 6 + 6",
            answer: "12",
            id: "3",
            difficulty: "hard",
            type: "mc",
        }
        roundStub = sinon.createStubInstance(mongoose.Document)
        roundStub.subject = "Linear Algebra"
        roundStub.study = ["CSE"]
        roundStub.mandatory_questions = [mandatoryQuestion]
        roundStub.bonus_questions = [bonusQuestionEasy, bonusQuestionHard]
        game = new Game([roundStub], [],"team1", map, "CSE")
    })
    afterEach(() => {
        sinon.restore()
    })

    describe("getNewQuestion function", () => {
        it("Get mandatory question", async () => {
            const res = await game.getNewQuestion("user1")
            expect(res).toEqual(mandatoryQuestion)
        })

        it("Get bonus question", async () => {
            user1.isOnMandatory = false
            const res = await game.getNewQuestion("user1", "easy")
            expect(res).toEqual(bonusQuestionEasy)
        })

        it("No diffculty for bonus question", async () => {
            user1.isOnMandatory = false
            await expect(game.getNewQuestion("user1")).rejects.toThrow(
                new Error("No difficulty was given")
            )
        })

        it("Error user not in game", async () => {
            await expect(game.getNewQuestion("user3")).rejects.toThrow(
                new Error("This user is not in this game")
            )
        })
    })

    describe("getMandatoryQuestion function", () => {
        it("Get mandatory question", async () => {
            const res = await game.getMandatoryQuestion(roundStub, user1)
            expect(res).toEqual(mandatoryQuestion)
            expect(user1.isOnMandatory).toEqual(false)
        })

        it("Error no more mandatory questions", async () => {
            user1.questionIds.push("1")
            await expect(game.getMandatoryQuestion(roundStub, user1)).rejects.toThrow(
                new Error("Could not generate new question")
            )
        })
        it("Invalid question for getMandatoryQuestion", async () => {
            user1.questionIds.push("58")
            await expect(game.getMandatoryQuestion(roundStub, user1)).rejects.toThrow(
                new Error("Could not generate new question")
            )
        })
    })

    describe("getBonusQuestion function", () => {
        it("Get bonus question", async () => {
            const res = await game.getBonusQuestion(roundStub, user1, "easy")
            expect(res).toEqual(bonusQuestionEasy)
        })

        it("Error no more bonus questions", async () => {
            user1.questionIds.push("2")
            user1.isOnMandatory = false
            await expect(game.getBonusQuestion(roundStub, user1, "easy")).rejects.toThrow(
                new Error("All variants have been used already")
            )
        })
    })

    describe("variantToQuestion", () => {
        let questionStub: sinon.SinonStubbedInstance<mongoose.Document>
        let getVariantByIdStub

        beforeEach(() => {
            questionStub = sinon.createStubInstance(mongoose.Document)
            questionStub.id = "5"
        })

        it("Get Question without variants", async () => {
            questionStub.variants = undefined
            questionStub.id = "5"
            const res = await game.variantToQuestion(questionStub, user1)
            expect(res).toEqual(questionStub)
            expect(user1.currentQuestion).toEqual(questionStub)
            expect(user1.questionIds).toEqual(["5"])
        })
        it("Get Question with empty variants list", async () => {
            questionStub.variants = []
            questionStub.id = "5"
            const res = await game.variantToQuestion(questionStub, user1)
            expect(res).toEqual(questionStub)
            expect(user1.currentQuestion).toEqual(questionStub)
            expect(user1.questionIds).toEqual(["5"])
        })
        it("Get Question with variants", async () => {
            getVariantByIdStub = sinon
                .stub(questionDBControllerModule, "getVariantById")
                .resolves({ A: "1", B: "2", C: "3" })
            questionStub.variants = ["random variant id"]
            questionStub.question = "What is [!A!] + [!B!]"
            questionStub.answer = "[!C!]"
            const res = await game.variantToQuestion(questionStub, user1)
            if (res === undefined) return fail
            expect(res.question).toEqual("What is 1 + 2")
            expect(res.answer).toEqual("3")
            expect(user1.currentQuestion).toEqual(res)
            expect(user1.questionIds).toEqual(["random variant id"])
        })
        it("Error Question with invalid variants", async () => {
            getVariantByIdStub = sinon
                .stub(questionDBControllerModule, "getVariantById")
                .resolves(undefined)
            questionStub.variants = ["random variant id"]
            await expect(game.variantToQuestion(questionStub, user1)).rejects.toThrow(
                new Error("Variant was not found")
            )
        })
    })

    describe("checkAnswer", () => {
        let questionStub: sinon.SinonStubbedInstance<mongoose.Document>

        beforeEach(() => {
            questionStub = sinon.createStubInstance(mongoose.Document)
            questionStub.answer = "This is my answer"
            user1.currentQuestion = questionStub
            user2.currentQuestion = questionStub
        })

        it("Error user not in game", async () => {
            await expect(game.getNewQuestion("user55")).rejects.toThrow(
                new Error("This user is not in this game")
            )
        })

        it("Answer is correct", () => {
            questionStub.difficulty = "easy"
            const res = game.checkAnswer("user1", "This is my answer")
            expect(res[0]).toEqual(true)
        })

        it("Answer is incorrect", () => {
            user1.currentQuestion = questionStub
            const res = game.checkAnswer("user1", "This is not the answer")
            expect(res[0]).toEqual(false)
            expect(user1.attempts).toEqual(2)
        })

        it("Correct score update easy", () => {
            questionStub.difficulty = "easy"
            const res = game.checkAnswer("user1", "This is my answer")
            expect(res[0]).toEqual(true)
            expect(user1.score).toEqual(10)
            expect(game.totalScore).toEqual(10)
            expect(game.avgScore).toEqual(5)
        })

        it("Correct score update medium", () => {
            questionStub.difficulty = "medium"
            const res = game.checkAnswer("user1", "This is my answer")
            expect(res[0]).toEqual(true)
            expect(user1.score).toEqual(50)
            expect(game.totalScore).toEqual(50)
            expect(game.avgScore).toEqual(25)
        })

        it("Correct score update hard", () => {
            questionStub.difficulty = "hard"
            const res = game.checkAnswer("user1", "This is my answer")
            expect(res[0]).toEqual(true)
            expect(user1.score).toEqual(150)
            expect(game.totalScore).toEqual(150)
            expect(game.avgScore).toEqual(75)
        })

        it("Correct score update multiple answers", () => {
            questionStub.difficulty = "easy"
            let res = game.checkAnswer("user1", "This is my answer")
            expect(res[0]).toEqual(true)
            questionStub.difficulty = "hard"
            res = game.checkAnswer("user1", "This is my answer")
            expect(res[0]).toEqual(true)
            expect(user1.score).toEqual(190)
            expect(game.totalScore).toEqual(190)
            expect(game.avgScore).toEqual(95)
        })

        it("Correct score update multiple users", () => {
            questionStub.difficulty = "easy"
            let res = game.checkAnswer("user1", "This is my answer")
            expect(res[0]).toEqual(true)
            questionStub.difficulty = "hard"
            res = game.checkAnswer("user2", "This is my answer")
            expect(res[0]).toEqual(true)
            questionStub.difficulty = "medium"
            res = game.checkAnswer("user2", "This is my answer")
            expect(res[0]).toEqual(true)
            expect(user1.score).toEqual(10)
            expect(Math.floor(game.totalScore)).toEqual(220)
            expect(game.avgScore).toEqual(110)
        })
    })

    describe("calculateScore tests", () => {
        let questionStub: sinon.SinonStubbedInstance<mongoose.Document>

        beforeEach(() => {
            questionStub = sinon.createStubInstance(mongoose.Document)
            questionStub.answer = "This is my answer"
            user1.currentQuestion = questionStub
            user2.currentQuestion = questionStub
        })

        it("User streaks", () => {
            questionStub.difficulty = "easy"
            const user1 = new User()
            user1.score = 10
            user1.streak = 3
            let res = game.calculateScore(questionStub, user1)
            expect(res).toBe(13)
            user1.score = 10
            user1.streak = 4
            res = game.calculateScore(questionStub, user1)
            expect(res).toBe(15)
            user1.score = 10
            user1.streak = 34
            res = game.calculateScore(questionStub, user1)
            expect(res).toBe(15)
        })

        // it ("Invalid question", () => {
        //     questionStub.difficulty = "invalidDiff"
        //     const user2 = new User()
        //     // expect(game.calculateScore(questionStub, user2))
        //     //     .toThrowError("The difficulty of this question is invalid")
        //     const func = game.calculateScore(questionStub, user2)
        //     const expected = new Error("The difficulty of this question is invalid")
        //     assert.throws(func, expected);
        // })
    })

    describe("checkpoints", () => {
        it("Add a checkpoint", () => {
            game.addCheckpoint(105)
            expect(game.checkpoints.length).toBe(1)
        })
    })
})
