import { fireEvent, render, screen, act } from "@testing-library/react"
import React from "react"
import Question from "../components/Questions/Question"
import MultipleChoice from "../components/Questions/MultipleChoiceQuestions/MultipleChoice"
import { BrowserRouter as Router } from "react-router-dom"
import { SocketServerMock, SocketClientMock } from "socket.io-mock-ts"

describe("Question component tests", () => {
    let socket: SocketServerMock
    let client: SocketClientMock

    beforeEach(() => {
        socket = new SocketServerMock()
        client = socket.clientMock
        render(
            <Router>
                <MultipleChoice
                    latex={"Question 123"}
                    answers={["answer1", "answer2", "answer3"]}
                    questionNum={1}
                    disableButton={false}
                    theme="Boat"
                ></MultipleChoice>
            </Router>
        )
    })

    test("Question rendered correctly", () => {
        const question = screen.getByText("Question 123")
        expect(question).toBeInTheDocument()
    })
})
