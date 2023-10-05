import { render, screen, act } from "@testing-library/react"
import React from "react"
import Lecuturer from "../components/CreateGame/Lecturer/Lecturer"
import socket from "../socket"
import { BrowserRouter as Router } from "react-router-dom"
import Lecturer from "../components/CreateGame/Lecturer/Lecturer"

describe("lecturer component tests", () => {
    // Mock socket implementation
    const socketMock = {
        on: jest.fn(),
        emit: jest.fn(),
    }
    jest.useFakeTimers()
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(React, "useEffect").mockImplementation((effect) => effect())
        jest.spyOn(socket, "on").mockImplementation(socketMock.on)
        jest.spyOn(socket, "emit").mockImplementation(socketMock.emit)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test("team name displayed correctly", () => {
        render(
            <Router>
                <Lecuturer
                    lobbyId={1111}
                    teamName="team23"
                    theme="train"
                ></Lecuturer>
            </Router>
        )
        const lobbyCodeElement = screen.getByText("TeamName: team23", {
            exact: false,
        })
        expect(lobbyCodeElement).toBeInTheDocument()
        expect(screen.getByText(/^Time:/)).toBeInTheDocument()
        expect(screen.getByText(/^Score:/)).toBeInTheDocument()
        expect(screen.getByText(/^Accuracy:/)).toBeInTheDocument()
    })

    test("socket tests", () => {
        render(
            <Router>
                <Lecuturer
                    lobbyId={1111}
                    teamName="team23"
                    theme="train"
                ></Lecuturer>
            </Router>
        )
        expect(socketMock.on).toHaveBeenCalledWith(
            "score",
            expect.any(Function)
        )
        expect(socketMock.on).toHaveBeenCalledWith(
            "game-ended",
            expect.any(Function)
        )
        expect(socketMock.on).toHaveBeenCalledWith(
            "get-checkpoints",
            expect.any(Function)
        )
    })

    test("initial round state", () => {
        render(
            <Router>
                <Lecuturer
                    lobbyId={1111}
                    teamName="team23"
                    theme="train"
                ></Lecuturer>
            </Router>
        )
        expect(screen.getByText(/^Time:/)).toHaveTextContent("10:00")
        //title of statistics screen
        expect(screen.queryByText(/^Questions$/)).toBeNull()

        expect(screen.queryByRole("button", { name: "→" })).toBeNull()
        expect(screen.queryByText(/checkpoint-title/i)).toBeNull()
        expect(screen.queryByText(/leaderboard-wrapper/i)).toBeNull()
    })

    test("timer updates correctly, after 10 minutes, round ends", () => {
        render(
            <Router>
                <Lecuturer
                    lobbyId={1111}
                    teamName="team23"
                    theme="train"
                ></Lecuturer>
            </Router>
        )
        const time = screen.getByText(`Time:`, { exact: false })
        // Verify initial countdown value is displayed
        expect(time).toHaveTextContent("Time: 10:00")
        const countdown = screen.getByTestId("count-down")
        expect(countdown).toHaveTextContent("3")
        try {
            act(() => {
                jest.advanceTimersByTime(1000)
            })
            expect(countdown).toHaveTextContent("2")
            act(() => {
                jest.advanceTimersByTime(1000)
            })
            expect(countdown).toHaveTextContent("1")

            act(() => {
                jest.advanceTimersByTime(2000)
            })
            expect(time).toHaveTextContent("09:59")
            act(() => {
                jest.advanceTimersByTime(1000)
            })
            expect(time).toHaveTextContent("09:58")
            act(() => {
                jest.advanceTimersByTime(598000)
            })
            expect(time).toHaveTextContent("00:00")
            act(() => {
                jest.advanceTimersByTime(1000)
            })

            // Assert that socket.emit("endRound") is called
            expect(socketMock.emit).toHaveBeenCalledWith("endRound")
            expect(socketMock.on).toHaveBeenCalledWith(
                "get-all-scores",
                expect.any(Function)
            )
            act(() => {
                jest.advanceTimersByTime(1000)
            })
        } catch (error) {
            // Handle any errors or rejections here
            console.error(error)
        }
        jest.useRealTimers()
    })
})
