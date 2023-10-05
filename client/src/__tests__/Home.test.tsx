import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import Home from "../components/Home/Home"
import { BrowserRouter as Router } from "react-router-dom"

describe("Home component tests", () => {
    test("Home renders correctly", () => {
        render(
            <Router>
                <Home />
            </Router>
        )
        const home = screen.getByText("RAcing Linear Algebra")
        expect(home).toBeInTheDocument()
        const createGameButton = screen.getByText("Create Game")
        const joinGameButton = screen.getByText("Join Game")
        expect(createGameButton).toBeInTheDocument()
        expect(joinGameButton).toBeInTheDocument()
    })

    test("Create game routing works correctly", () => {
        render(
            <Router>
                <Home />
            </Router>
        )
        const createGameButton = screen.getByText("Create Game")
        fireEvent.click(createGameButton)
        expect(window.location.pathname).toBe("/CreateGame")
    })

    test("Join game routing works correctly", () => {
        render(
            <Router>
                <Home />
            </Router>
        )
        const joinGameButton = screen.getByText("Join Game")
        fireEvent.click(joinGameButton)
        expect(window.location.pathname).toBe("/JoinGame")
    })
})
