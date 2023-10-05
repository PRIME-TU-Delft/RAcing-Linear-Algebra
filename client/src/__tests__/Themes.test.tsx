import { render, screen } from "@testing-library/react"
import React from "react"
import Themes from "../components/CreateGame/Lobby/Themes/Themes"
import { Simulate, act } from "react-dom/test-utils"

describe("Themes component tests", () => {
    const mockOnSelectTheme = jest.fn((theme: string) => theme)
    const mockOnStepCompleted = jest.fn()

    test("Selects theme correctly", () => {
        render(
            <Themes
                onSelectTheme={mockOnSelectTheme}
                onStepCompleted={mockOnStepCompleted}
            ></Themes>
        )

        const trainElement = screen.getByText("Train", { exact: false })
        expect(trainElement).toBeInTheDocument()

        act(() => {
            Simulate.click(trainElement)
        })
        expect(mockOnSelectTheme.mock.calls[0][0]).toBe("Train")
    })

    test("Marks step completed correctly", () => {
        render(
            <Themes
                onSelectTheme={mockOnSelectTheme}
                onStepCompleted={mockOnStepCompleted}
            ></Themes>
        )

        const trainElement = screen.getByText("Train", { exact: false })
        expect(trainElement).toBeInTheDocument()

        act(() => {
            Simulate.click(trainElement)
        })
        expect(mockOnStepCompleted).toHaveBeenCalled()
    })
})
