import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { BrowserRouter as Router } from "react-router-dom"
import { SocketClientMock, SocketServerMock } from "socket.io-mock-ts"
import DifficultySelection from "../components/Questions/DifficultySelection/DifficultySelection"
import Question from "../components/Questions/Question"

describe("Difficulty selection tests", () => {
    let socket: SocketServerMock
    let client: SocketClientMock

    beforeEach(() => {
        socket = new SocketServerMock()
        client = socket.clientMock
        const setOpen = vi.fn()
        render(
            <DifficultySelection
                setOpen={setOpen}
                open={true}
                type="correct"
            ></DifficultySelection>
        )
    })

    test("Modal is visible whenever it gets socket message", () => {
        render(
            <Router>
                <Question theme="Boat"></Question>
            </Router>
        )
        socket.emit("chooseDiffuculty")
        const modalText = screen.getByText(
            "Choose the difficulty for your next question"
        )
        expect(modalText).toBeInTheDocument()
    })

    test("Clicking easy button sends correct message to server", () => {
        socket.on("getNewQuestion", (difficulty: string) => {
            expect(difficulty).toBe("easy")
        })
        const easyButton = screen.getByText("😃")
        expect(easyButton).toBeInTheDocument()
        fireEvent.click(easyButton)
    })

    test("Clicking medium button sends correct message to server", () => {
        socket.on("getNewQuestion", (difficulty: string) => {
            expect(difficulty).toBe("medium")
        })
        const mediumButton = screen.getByText("😐")
        expect(mediumButton).toBeInTheDocument()
        fireEvent.click(mediumButton)
    })

    test("Clicking hard button sends correct message to server", () => {
        socket.on("getNewQuestion", (difficulty: string) => {
            expect(difficulty).toBe("hard")
        })
        const hardButton = screen.getByText("😈")
        expect(hardButton).toBeInTheDocument()
        fireEvent.click(hardButton)
    })
})
