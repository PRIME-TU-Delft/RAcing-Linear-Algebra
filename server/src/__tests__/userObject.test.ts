import { User } from "../objects/userObject"

const sinon = require("sinon")
sinon.stub(Math, "random").returns(0.4)

describe("Generate random question", () => {
    let user

    beforeEach(() => {
        user = new User()
        user.questionIds.push("2")
        user.questionIds.push("3")
    })

    it("Succesful", () => {
        const res = user.getRandomQuestionId(["1", "2", "3", "4"])
        expect(res).toEqual("1")
    })

    it("Error", () => {
        expect(() => user.getRandomQuestionId(["2", "3"])).toThrow(
            new Error("All variants have been used already")
        )
    })
})
