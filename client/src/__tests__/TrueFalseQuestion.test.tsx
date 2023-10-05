import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { BrowserRouter as Router } from "react-router-dom"
import { SocketClientMock, SocketServerMock } from "socket.io-mock-ts"
import TrueFalseQuestion from "../components/Questions/MultipleChoiceQuestions/TrueFalseQuestion"

describe("Question component tests", () => {
    let socket: SocketServerMock
    let client: SocketClientMock

    beforeEach(() => {
        socket = new SocketServerMock()
        client = socket.clientMock
        render(
            <Router>
                <TrueFalseQuestion
                    latex="test"
                    theme="Boat"
                    questionNum={1}
                    disableButton={false}
                ></TrueFalseQuestion>
            </Router>
        )
    })

    test("False renders + behaves correctly", () => {
        const falseButton = screen.getByText("False")
        expect(falseButton).toBeInTheDocument()
        socket.on("checkAnswer", (data: string) => {
            expect(data).toBe("False")
        })
        fireEvent.click(falseButton)
    })

    test("True renders + behaves correctly", () => {
        const trueButton = screen.getByText("True")
        expect(trueButton).toBeInTheDocument()
        if (socket)
            socket.on("checkAnswer", (data: string) => {
                expect(data).toBe("True")
            })
        fireEvent.click(trueButton)
    })

    test("Question renders correctly", () => {
        const question = screen.getByText("test")
        expect(question).toBeInTheDocument()
    })
})
