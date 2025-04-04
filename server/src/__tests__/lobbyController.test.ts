import request from "supertest"
import app from "../app"
import { makeLobbyNotJoinable } from "../controllers/lobbyController"
const sinon = require("sinon")
const stub = sinon.stub()
stub.withArgs("CSE").returns(["Determinants"])
stub.withArgs("AE").throws(new Error("No topics found for AE study"))

describe("Create lobby function", () => {
    it("Succesful", async () => {
        const result: request.Response = await request(app).get("/api/lobby/create")
        expect(result.statusCode).toEqual(200)
        expect(result.body[0]).toBeGreaterThanOrEqual(1)
        expect(result.body[0]).toBeLessThanOrEqual(9999)
    })
})

describe("Validate lobby Id Endpoint", () => {
    const path = "/api/lobby/validate/"

    it("Not started game", async () => {
        const result1: request.Response = await request(app).get("/api/lobby/create")
        expect(result1.statusCode).toEqual(200)
        const lobbyId: number = result1.body[0]
        const str = `${path}${lobbyId}`

        const result2: request.Response = await request(app).get(str)
        expect(result2.statusCode).toEqual(200)
        expect(result2.body).toBe(true)
    })

    it("Started game", async () => {
        const result1: request.Response = await request(app).get("/api/lobby/create")
        expect(result1.statusCode).toEqual(200)
        const lobbyId: number = result1.body[0]
        const str = `${path}${lobbyId}`
        makeLobbyNotJoinable(lobbyId)

        const result2: request.Response = await request(app).get(str)
        expect(result2.statusCode).toEqual(200)
        expect(result2.body).toBe(false)
    })

    it("Invalid LobbyId", async () => {
        const result: request.Response = await request(app).get("/api/lobby/validate/0")
        expect(result.statusCode).toEqual(200)
        expect(result.body).toBe(false)
    })
})
