import sinon from "sinon"
import mongoose from "mongoose"
import { checkAnswerEqual } from "../latexParser"
describe("Test latex", () => {
    let mcQuestion, commaQuestion, mathQuestion, infiniteQuestion, infiniteQuestionNoRule
    let plusQuestion, minusQuestionWithVariable, plusQuestionWithVariable

    beforeEach(() => {
        mcQuestion = { answer: "4", type: "mc" }
        commaQuestion = { answer: "a,b,c", type: "open" }
        mathQuestion = { answer: "3", type: "open" }
        infiniteQuestion = {
            answer: "\\left\\{\\begin{pmatrix}--5\\\\1\\\\0\\end{pmatrix},\\begin{pmatrix}-1\\\\1\\\\0\\end{pmatrix}\\right\\}",
            type: "open-infinite",
            specialRule: "multiples-allowed",
        }
        infiniteQuestionNoRule = {
            answer: "\\left\\{\\begin{pmatrix}--5\\\\1\\\\0\\end{pmatrix},\\begin{pmatrix}-1\\\\1\\\\0\\end{pmatrix}\\right\\}",
            type: "open-infinite",
        }
        plusQuestion = { answer: "3+-5", type: "open" }
        minusQuestionWithVariable = { answer: "x--5", type: "open" }
        plusQuestionWithVariable = { answer: "x+-5", type: "open" }
    })

    test("Multiple choice question correct answer", () => {
        const res = checkAnswerEqual(mcQuestion, mcQuestion.answer, mcQuestion.answer)
        expect(res).toBe(true)
    })

    test("Multiple choice question incorrect answer", () => {
        const res = checkAnswerEqual(mcQuestion, mcQuestion.answer, "This is not the answer")
        expect(res).toBe(false)
    })

    test("Comma seperated answer all correct", () => {
        const res = checkAnswerEqual(commaQuestion, commaQuestion.answer, "a,b,c")
        expect(res).toBe(true)
    })

    test("Comma seperated answer all correct with spaces", () => {
        const res = checkAnswerEqual(commaQuestion, commaQuestion.answer, "a, b, c")
        expect(res).toBe(true)
    })

    test("Comma seperated answer all correct in wrong order", () => {
        const res = checkAnswerEqual(commaQuestion, commaQuestion.answer, "b,c,a")
        expect(res).toBe(true)
    })

    test("Comma seperated answer all correct in wrong order and spaces", () => {
        const res = checkAnswerEqual(commaQuestion, commaQuestion.answer, "b, c, a")
        expect(res).toBe(true)
    })

    test("Comma seperated answer 1 incorrect", () => {
        const res = checkAnswerEqual(commaQuestion, commaQuestion.answer, "a, b, d")
        expect(res).toBe(false)
    })

    test("Comma seperated answer incorrect length", () => {
        const res = checkAnswerEqual(commaQuestion, commaQuestion.answer, "a, d")
        expect(res).toBe(false)
    })

    test("parse multiply correctly", () => {
        const res = checkAnswerEqual(mathQuestion, mathQuestion.answer, "3\\cdot 1")
        expect(res).toBe(true)
    })

    test("parse plus correctly", () => {
        const res = checkAnswerEqual(mathQuestion, mathQuestion.answer, "2\\ +\\ 1")
        expect(res).toBe(true)
    })

    test("parse fraction correctly", () => {
        const res = checkAnswerEqual(mathQuestion, mathQuestion.answer, "\\frac{3}{1}")
        expect(res).toBe(true)
    })

    test("parse infite answer correctly", () => {
        const res = checkAnswerEqual(
            infiniteQuestion,
            infiniteQuestion.answer,
            "\\left\\{\\begin{pmatrix}--5\\\\1\\\\0\\end{pmatrix},\\begin{pmatrix}-1\\\\1\\\\0\\end{pmatrix}\\right\\}"
        )
        expect(res).toBe(true)
    })

    test("parse infite answer differently correctly", () => {
        const res = checkAnswerEqual(
            infiniteQuestion,
            infiniteQuestion.answer,
            "\\left\\{\\begin{pmatrix}--10\\\\2\\\\0\\end{pmatrix},\\begin{pmatrix}-2\\\\2\\\\0\\end{pmatrix}\\right\\}"
        )
        expect(res).toBe(true)
    })

    test("parse infinte answer no rule correctly", () => {
        const res = checkAnswerEqual(
            infiniteQuestionNoRule,
            infiniteQuestionNoRule.answer,
            "\\left\\{\\begin{pmatrix}--5\\\\1\\\\0\\end{pmatrix},\\begin{pmatrix}-1\\\\1\\\\0\\end{pmatrix}\\right\\}"
        )
        expect(res).toBe(true)
    })

    test("parse infinte answer no rule incorrectrly", () => {
        const res = checkAnswerEqual(
            infiniteQuestionNoRule,
            infiniteQuestionNoRule.answer,
            "\\left\\{\\begin{pmatrix}--10\\\\2\\\\0\\end{pmatrix},\\begin{pmatrix}-2\\\\2\\\\0\\end{pmatrix}\\right\\}"
        )
        expect(res).toBe(false)
    })

    test("parse infinte answer no rule incorrectrly", () => {
        const res = checkAnswerEqual(
            infiniteQuestionNoRule,
            infiniteQuestionNoRule.answer,
            "\\left\\{\\begin{pmatrix}--10\\\\2\\\\0\\end{pmatrix},\\begin{pmatrix}-2\\\\2\\\\0\\end{pmatrix}\\right\\}"
        )
        expect(res).toBe(false)
    })

    test("parse plus correctly", () => {
        const res = checkAnswerEqual(plusQuestion, plusQuestion.answer, "-2")
        expect(res).toBe(true)
    })

    test("parse minus correctly with variable", () => {
        const res = checkAnswerEqual(
            minusQuestionWithVariable,
            minusQuestionWithVariable.answer,
            "x+5"
        )
        expect(res).toBe(true)
    })

    test("parse plus correctly with variable", () => {
        const res = checkAnswerEqual(
            plusQuestionWithVariable,
            plusQuestionWithVariable.answer,
            "x-5"
        )
        expect(res).toBe(true)
    })
})
