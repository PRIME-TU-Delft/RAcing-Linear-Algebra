import { act, render, screen } from "@testing-library/react"
import React from "react"
import Rounds from "../components/CreateGame/Lobby/Rounds/Rounds"
import Round from "../components/CreateGame/Lobby/Rounds/Round/Round"
import { Simulate } from "react-dom/test-utils"

describe("Rounds component tests", () => {
    const mockOnRoundSelected = jest.fn((rounds: string[]) => rounds)
    const mockOnStepCompleted = jest.fn((completed: boolean) => completed)

    test("Rounds rendered correctly", () => {
        render(
            <Rounds
                onRoundSelected={mockOnRoundSelected}
                onStepCompleted={mockOnStepCompleted}
                availableRounds={["First", "Second", "Third"]}
            ></Rounds>
        )

        const firstRound = screen.getByText("First")
        const secondRound = screen.getByText("Second")
        const thirdRound = screen.getByText("Third")

        expect(firstRound).toBeInTheDocument()
        expect(secondRound).toBeInTheDocument()
        expect(thirdRound).toBeInTheDocument()
    })

    test("Round selected correctly", () => {
        render(
            <Rounds
                onRoundSelected={mockOnRoundSelected}
                onStepCompleted={mockOnStepCompleted}
                availableRounds={["First", "Second", "Third"]}
            ></Rounds>
        )

        const roundElement = screen.getByText("First")

        act(() => {
            Simulate.click(roundElement)
        })

        expect(mockOnRoundSelected.mock.calls[0][0]).toHaveLength(1)
        expect(mockOnRoundSelected.mock.calls[0][0]).toContain("First")
    })

    test("Step completed correctly", () => {
        render(
            <Rounds
                onRoundSelected={mockOnRoundSelected}
                onStepCompleted={mockOnStepCompleted}
                availableRounds={["First", "Second", "Third"]}
            ></Rounds>
        )

        const roundElement = screen.getByText("First")

        act(() => {
            Simulate.click(roundElement)
        })

        expect(mockOnStepCompleted).toHaveBeenCalled()
        expect(mockOnStepCompleted.mock.calls[0][0]).toBe(true)
    })

    test("Select multiple rounds correctly", () => {
        render(
            <Rounds
                onRoundSelected={mockOnRoundSelected}
                onStepCompleted={mockOnStepCompleted}
                availableRounds={["First", "Second", "Third"]}
            ></Rounds>
        )

        const firstRoundElement = screen.getByText("First")
        const secondRoundElement = screen.getByText("Second")

        act(() => {
            Simulate.click(firstRoundElement)
            Simulate.click(secondRoundElement)
        })

        expect(mockOnRoundSelected.mock.calls[0][0]).toHaveLength(2)
        expect(mockOnRoundSelected.mock.calls[0][0]).toContain("First")
        expect(mockOnRoundSelected.mock.calls[0][0]).toContain("Second")
    })

    test("Deselects round correctly", () => {
        render(
            <Rounds
                onRoundSelected={mockOnRoundSelected}
                onStepCompleted={mockOnStepCompleted}
                availableRounds={["First", "Second", "Third"]}
            ></Rounds>
        )

        const firstRoundElement = screen.getByText("First")

        act(() => {
            Simulate.click(firstRoundElement)
        })

        expect(mockOnRoundSelected.mock.calls[0][0]).toHaveLength(1)
        expect(mockOnRoundSelected.mock.calls[0][0]).toContain("First")
        expect(mockOnStepCompleted.mock.calls[0][0]).toBe(true)

        act(() => {
            Simulate.click(firstRoundElement)
        })

        expect(mockOnRoundSelected.mock.calls[1][0]).toHaveLength(0)
        expect(mockOnStepCompleted.mock.calls[1][0]).toBe(false)
    })

    test("Deselects round correctly after selecting more than one works correctly", () => {
        render(
            <Rounds
                onRoundSelected={mockOnRoundSelected}
                onStepCompleted={mockOnStepCompleted}
                availableRounds={["First", "Second", "Third"]}
            ></Rounds>
        )

        const firstRoundElement = screen.getByText("First")
        const secondRoundElement = screen.getByText("Second")

        act(() => {
            Simulate.click(firstRoundElement)
        })

        expect(mockOnRoundSelected.mock.calls[0][0]).toHaveLength(1)
        expect(mockOnRoundSelected.mock.calls[0][0]).toContain("First")
        expect(mockOnStepCompleted.mock.calls[0][0]).toBe(true)

        act(() => {
            Simulate.click(secondRoundElement)
        })

        expect(mockOnRoundSelected.mock.calls[1][0]).toHaveLength(2)
        expect(mockOnRoundSelected.mock.calls[1][0]).toContain("Second")
        expect(mockOnStepCompleted.mock.calls[0][0]).toBe(true)

        act(() => {
            Simulate.click(firstRoundElement)
        })

        expect(mockOnRoundSelected.mock.calls[2][0]).toHaveLength(1)
        expect(mockOnStepCompleted).toHaveBeenCalledTimes(2)
    })

    test("Attempting to select more than 3 rounds fails", () => {
        render(
            <Rounds
                onRoundSelected={mockOnRoundSelected}
                onStepCompleted={mockOnStepCompleted}
                availableRounds={["First", "Second", "Third", "Fourth"]}
            ></Rounds>
        )

        const firstRoundElement = screen.getByText("First")
        const secondRoundElement = screen.getByText("Second")
        const thirdRoundElement = screen.getByText("Third")
        const fourthRoundElement = screen.getByText("Fourth")
        window.alert = jest.fn()

        act(() => {
            Simulate.click(firstRoundElement)
            Simulate.click(secondRoundElement)
            Simulate.click(thirdRoundElement)
        })

        expect(mockOnRoundSelected.mock.calls[0][0]).toHaveLength(3)
        expect(mockOnRoundSelected.mock.calls[0][0]).toContain("First")
        expect(mockOnRoundSelected.mock.calls[0][0]).toContain("Second")
        expect(mockOnRoundSelected.mock.calls[0][0]).toContain("Third")

        act(() => {
            Simulate.click(fourthRoundElement)
        })

        expect(mockOnRoundSelected.mock.calls[1][0]).toHaveLength(3)
        expect(mockOnRoundSelected.mock.calls[1][0]).not.toContain("Fourth")
        expect(window.alert).toHaveBeenCalled()
    })
})
