import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import React from "react"
import JoinGame from "../components/JoinGame/JoinGame"
import { BrowserRouter as Router } from "react-router-dom"

describe("Join game screen component tests", () => {
    test("incorrect length lobby id entered, components working correctly", async () => {
        render(
            <Router>
                <JoinGame></JoinGame>
            </Router>
        )
        const inputElement = screen.getByPlaceholderText("E.g. 1217", {
            exact: false,
        })

        const btn = screen.getByText("Join")
        expect(btn).toBeInTheDocument()
        fireEvent.change(inputElement, { target: { value: "abc" } })

        expect(
            screen.getByText("Join the game using the code from your lecturer!")
        ).toBeInTheDocument()
        expect(inputElement).toBeInTheDocument()
        expect(screen.getByText("\u2190")).toBeInTheDocument()
        const errorMessage = screen.queryByText(
            "The code should be a 4 digit number!"
        )

        // Assert that the error message is not found on the screen
        expect(errorMessage).toBeNull()
        fireEvent.click(btn)
        //found after clicking
        await waitFor(() => {
            expect(
                screen.getByText("The code should be a 4 digit number!")
            ).toBeInTheDocument()
        })
    })
})
