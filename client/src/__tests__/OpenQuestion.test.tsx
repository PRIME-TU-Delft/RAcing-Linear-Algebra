import { RenderResult, fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import OpenQuestion from "../components/Questions/OpenQuestion/OpenQuestion"
import QuestionForm from "../components/Questions/OpenQuestion/QuestionForm"
import { BrowserRouter as Router } from "react-router-dom"
import { SocketServerMock, SocketClientMock } from "socket.io-mock-ts"

describe("Question component tests", () => {
    let socket: SocketServerMock
    let client: SocketClientMock

    beforeEach(() => {
        socket = new SocketServerMock()
        client = socket.clientMock
        const setQuestionNum = jest.fn()
        render(
            <Router>
                <OpenQuestion
                    latex={"Question 123"}
                    questionNum={1}
                    disableButton={false}
                    theme="Boat"
                ></OpenQuestion>
            </Router>
        )
    })

    test("Question rendered correctly", () => {
        const question = screen.getByText("Question 123")
        expect(question).toBeInTheDocument()
    })

    test("Clicking fraction button inputs fraction in the math field", () => {
        const fractionButton = screen.getByTestId("fraction-button")
        fireEvent.click(fractionButton)
        const mathField = screen.getByTestId("math-field")
        // Weird workaround to get the MathQuill generated elements
        const fractionElement = mathField.childNodes[1].childNodes[0]
        expect(fractionElement).toHaveClass("mq-fraction")
    })

    test("Clicking sqrt button inputs sqrt in the math field", () => {
        const sqrtButton = screen.getByTestId("sqrt-button")
        fireEvent.click(sqrtButton)
        const mathField = screen.getByTestId("math-field")
        // Weird workaround to get the MathQuill generated elements
        const sqrtElement = mathField.childNodes[1].childNodes[0].childNodes[0]
        expect(sqrtElement.textContent).toBe("√")
    })

    test("Clicking subscript button inputs subscript in the math field", () => {
        const subButton = screen.getByTestId("sub-button")
        fireEvent.click(subButton)
        const mathField = screen.getByTestId("math-field")
        // Weird workaround to get the MathQuill generated elements
        const subElement = mathField.childNodes[1].childNodes[0]
        expect(subElement).toHaveClass("mq-supsub")
    })

    test("Clicking e button inputs e in the math field", () => {
        const eButton = screen.getByTestId("e-button")
        fireEvent.click(eButton)
        const mathField = screen.getByTestId("math-field")
        // Weird workaround to get the MathQuill generated elements
        const eElement = mathField.childNodes[1].childNodes[0]
        expect(eElement.textContent).toBe("e")
    })

    test("Answer is being sent", () => {
        const fractionButton = screen.getByTestId("fraction-button")
        fireEvent.click(fractionButton)
        socket.on("checkAnswer", (answer: string) => {
            expect(answer).toBe("\\frac{ }{ }")
        })
        const subtmitButton = screen.getByText("Check answer")
        fireEvent.click(subtmitButton)
    })
})
