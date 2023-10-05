import React from "react"
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react"
import { createMemoryHistory } from "history"
import { MemoryRouter } from "react-router-dom"
import Waiting from "../components/Waiting/Waiting"
import socket from "../socket"

describe("Waiting component", () => {
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
    test("renders train theme", () => {
        const history = createMemoryHistory()
        render(
            <MemoryRouter>
                <Waiting theme="Train" setTheme={jest.fn()} />
            </MemoryRouter>
        )

        const waitingMessage = screen.getByText(
            "Waiting for the lecturer to start"
        )
        expect(waitingMessage).toBeInTheDocument()

        const backButton = screen.getByRole("button", { name: "\u2190" })
        expect(backButton).toBeInTheDocument()

        fireEvent.click(backButton)
        expect(history.location.pathname).toBe("/")
    })

    test("renders Boat theme", () => {
        const setThemeMock = jest.fn()

        render(
            <MemoryRouter>
                <Waiting theme="Boat" setTheme={setThemeMock} />
            </MemoryRouter>
        )

        // Emit the 'themeChange' event on the mock socket
        const theme = "Train"
        socketMock.on.mock.calls[1][1](theme)

        expect(setThemeMock).toHaveBeenCalledWith(theme)
    })
    test("navigates to game", () => {
        jest.useFakeTimers()
        const setThemeMock = jest.fn()
        render(
            <MemoryRouter>
                <Waiting theme="Boat" setTheme={setThemeMock} />
            </MemoryRouter>
        )

        socketMock.on.mock.calls[0][1]()

        expect(screen.getByTestId("countdown")).toHaveTextContent("-1")

        act(() => {
            jest.advanceTimersByTime(2000)
        })
        expect(screen.getByTestId("countdown")).toHaveTextContent("1")

        jest.useRealTimers()
    })
})
