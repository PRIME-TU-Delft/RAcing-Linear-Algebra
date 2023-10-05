import { act, render, screen } from "@testing-library/react"
import React from "react"
import Studies from "../components/CreateGame/Lobby/Studies/Studies"
import { Simulate } from "react-dom/test-utils"

describe("Studies component tests", () => {
    const mockOnSelectStudy = jest.fn((study: string) => study)
    const mockOnStepCompleted = jest.fn()

    test("Selects study correctly", () => {
        render(
            <Studies
                onSelectStudy={mockOnSelectStudy}
                onStepCompleted={mockOnStepCompleted}
            ></Studies>
        )

        const trainElement = screen.getByText(
            "Computer Science and Engineering",
            { exact: false }
        )
        expect(trainElement).toBeInTheDocument()

        act(() => {
            Simulate.click(trainElement)
        })
        expect(mockOnSelectStudy.mock.calls[0][0]).toBe("cse")
    })

    test("Marks step completed correctly", () => {
        render(
            <Studies
                onSelectStudy={mockOnSelectStudy}
                onStepCompleted={mockOnStepCompleted}
            ></Studies>
        )

        const trainElement = screen.getByText(
            "Computer Science and Engineering",
            { exact: false }
        )
        expect(trainElement).toBeInTheDocument()

        act(() => {
            Simulate.click(trainElement)
        })
        expect(mockOnStepCompleted).toHaveBeenCalled()
    })
})
