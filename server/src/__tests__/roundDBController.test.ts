import { getIRounds, getRoundQuestions, getTopicsByStudy } from "../controllers/roundDBController"
import { Round } from "../models/roundModel"

// Mock the Round model and its methods
jest.mock("../models/roundModel")

describe("roundDBController tests", () => {
    test("getRoundQuestions should return the question for the given round", async () => {
        const mockRound = {
            study: ["CSE", "AE"],
            subject: "Determinants",
            mandatory_questions: [
                {
                    _id: 1,
                    question: "What is a determinant?",
                    answer: "42",
                    type: "open",
                    difficulty: "mandatory",
                    subject: "Determinants",
                },
            ],
            bonus_questions: [
                {
                    _id: 2,
                    question: "What are the properties of a determinant?",
                    answer: "idk",
                    type: "true/false",
                    difficulty: "hard",
                    subject: "Determinants",
                },
            ],
        }

        jest.spyOn(Round, "findOne").mockReturnValueOnce({
            populate: jest.fn().mockReturnValueOnce({
                populate: jest.fn().mockResolvedValueOnce(mockRound),
            }),
        } as any)

        const results = await getRoundQuestions("Determinants")
        expect(results).not.toBeUndefined()
        if (results) {
            expect(results[0]).toEqual({
                _id: 1,
                question: "What is a determinant?",
                answer: "42",
                type: "open",
                difficulty: "mandatory",
                subject: "Determinants",
            })
            expect(results[1]).toEqual({
                _id: 2,
                question: "What are the properties of a determinant?",
                answer: "idk",
                type: "true/false",
                difficulty: "hard",
                subject: "Determinants",
            })
        }
    })

    test("getTopicsByStudy should return the question for the given round", async () => {
        const mockRound = {
            study: ["CSE", "AE"],
            subject: "Determinants",
            mandatory_questions: [],
            bonus_questions: [],
        }

        jest.spyOn(Round, "find").mockResolvedValueOnce([mockRound])
        const results = await getTopicsByStudy("CSE")
        expect(results[0]).toBe("Determinants")
    })

    test("getTopicsByStudy should return multiple subjects", async () => {
        const mockRound = [
            {
                study: ["CSE", "AE"],
                subject: "Determinants",
                mandatory_questions: [],
                bonus_questions: [],
            },
            {
                study: ["CSE"],
                subject: "Diagonalization",
                mandatory_questions: [],
                bonus_questions: [],
            },
        ]

        jest.spyOn(Round, "find").mockResolvedValueOnce(mockRound)
        const results = await getTopicsByStudy("CSE")
        expect(results).toEqual(["Determinants", "Diagonalization"])
    })

    test("getTopicsByStudy throws error when it does not find", async () => {
        const mockRound = []

        jest.spyOn(Round, "find").mockResolvedValueOnce(mockRound)
        await expect(getTopicsByStudy("AE")).rejects.toThrowError("No topics found AE")
    })

    test("getTopicsByStudy throws error when it round doesn't have subject", async () => {
        const mockRound = [
            {
                study: ["CSE", "AE"],
                mandatory_questions: [],
                bonus_questions: [],
            },
            {
                study: ["CSE"],
                mandatory_questions: [],
                bonus_questions: [],
            },
        ]

        jest.spyOn(Round, "find").mockResolvedValueOnce(mockRound)
        await expect(getTopicsByStudy("AE")).rejects.toThrowError(
            "These rounds dont have a subject"
        )
    })

    test("getIRounds should return the appropriate rounds", async () => {
        const mockRound = [
            {
                study: ["CSE", "AE"],
                subject: "Determinants",
                mandatory_questions: [],
                bonus_questions: [],
            },
            {
                study: ["CSE"],
                subject: "Diagonalization",
                mandatory_questions: [],
                bonus_questions: [],
            },
        ]

        jest.spyOn(Round, "find").mockReturnValueOnce({
            populate: jest.fn().mockReturnValueOnce({
                populate: jest.fn().mockResolvedValueOnce(mockRound),
            }),
        } as any)

        const results = await getIRounds("CSE", ["Determinants"])
        expect(results.length).toBe(1)
        expect(results[0]).toEqual({
            study: ["CSE", "AE"],
            subject: "Determinants",
            mandatory_questions: [],
            bonus_questions: [],
        })
    })

    test("getIRounds throws error when its doesn't find", async () => {
        const mockRound = []

        jest.spyOn(Round, "find").mockReturnValueOnce({
            populate: jest.fn().mockReturnValueOnce({
                populate: jest.fn().mockResolvedValueOnce(mockRound),
            }),
        } as any)

        await expect(getIRounds("CSE", ["Determinants"])).rejects.toThrowError(
            "There are no topics for CSE"
        )
    })
})
