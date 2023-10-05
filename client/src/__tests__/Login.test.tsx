import Login from "../components/CreateGame/Login/Login"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import React from "react"
import { BrowserRouter as Router } from "react-router-dom"
import socket from "../socket"

describe("Login component", () => {
    const socketMock = {
        off: () => ({ on: jest.fn() }),
        on: jest.fn(),
        emit: jest.fn(),
    }
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(React, "useEffect").mockImplementation((effect) => effect())
        jest.spyOn(socket, "on").mockImplementation(socketMock.on)
        jest.spyOn(socket, "emit").mockImplementation(socketMock.emit)
    })
    afterEach(() => {
        jest.restoreAllMocks()
    })

    test("navigates to home when back button is clicked", () => {
        const onLobbyIdCreatedMock = jest.fn()
        render(
            <Router>
                <Login onLobbyIdCreated={onLobbyIdCreatedMock} />
            </Router>
        )
        // Simulate a click on the back button
        const backButton = screen.getByText("←")
        fireEvent.click(backButton)

        // Assert that it navigates to the home route
        expect(window.location.pathname).toBe("/")
    })

    test("login form", () => {
        const onLobbyIdCreatedMock = jest.fn()
        render(
            <Router>
                <Login onLobbyIdCreated={onLobbyIdCreatedMock} />
            </Router>
        )
        // Assert that the login form is rendered
        const passwordForm = screen.getByPlaceholderText(/Password/i)
        expect(passwordForm).toBeInTheDocument()

        // Assert that the login button is rendered
        const loginButton = screen.getByTestId("login-button")
        expect(loginButton).toBeInTheDocument()
        // Simulate password input change
        fireEvent.change(passwordForm, { target: { value: "matematica123" } })

        // Simulate login button click
        fireEvent.click(loginButton)
        // Assert that the "authenticate" event is emitted with the correct password
        expect(socketMock.emit).toHaveBeenCalledWith(
            "authenticate",
            "matematica123"
        )
        // Mock the "authenticated" event with a true value
        const authenticatedHandler = socketMock.on.mock.calls.find(
            ([event]) => event === "authenticated"
        )[1]
        authenticatedHandler(true)
        expect(socketMock.on).toHaveBeenCalledWith(
            "authenticated",
            expect.any(Function)
        )
        const errorMessage = screen.getByTestId("message")
        expect(errorMessage).toHaveTextContent("")
    })
    test("login form, wrong password", async () => {
        const onLobbyIdCreatedMock = jest.fn()
        render(
            <Router>
                <Login onLobbyIdCreated={onLobbyIdCreatedMock} />
            </Router>
        )
        const passwordForm = screen.getByPlaceholderText(/Password/i)
        const loginButton = screen.getByTestId("login-button")
        fireEvent.change(passwordForm, { target: { value: "matematica123" } })
        fireEvent.click(loginButton)
        const authenticatedHandler = socketMock.on.mock.calls.find(
            ([event]) => event === "authenticated"
        )[1]
        authenticatedHandler(false)

        expect(socketMock.on).toHaveBeenCalledWith(
            "authenticated",
            expect.any(Function)
        )

        await waitFor(() => {
            const errorMessage = screen.getByTestId("message")
            expect(errorMessage).toHaveTextContent("Wrong password")
        })
    })
})
