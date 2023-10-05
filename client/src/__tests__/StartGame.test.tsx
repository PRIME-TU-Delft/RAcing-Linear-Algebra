import { act, render, screen } from "@testing-library/react"
import React from "react"
import StartGame from "../components/CreateGame/Lobby/StartGame/StartGame"
import { Simulate } from "react-dom/test-utils"
import { deepStrictEqual } from "assert"

describe("Start Game component tests", () => {
    const mockOnStartGame = jest.fn()

    test("Displays selections correctly when all steps completed", () => {
        render(
            <StartGame
                completedSteps={[true, true, true, true]}
                selectedTheme="Train"
                selectedStudy="CSE"
                selectedRounds={["First", "Second"]}
                onStartGame={mockOnStartGame}
            ></StartGame>
        )

        const themeElement = screen.getByText("Selected theme: Train")
        const studyElement = screen.getByText("Selected study: CSE")
        const roundsElement = screen.getByText(
            "Selected rounds: First and Second"
        )

        expect(themeElement).toBeInTheDocument()
        expect(studyElement).toBeInTheDocument()
        expect(roundsElement).toBeInTheDocument()
    })

    test("Button when all steps completed works correctly", () => {
        render(
            <StartGame
                completedSteps={[true, true, true, true]}
                selectedTheme="Train"
                selectedStudy="CSE"
                selectedRounds={["First", "Second"]}
                onStartGame={mockOnStartGame}
            ></StartGame>
        )

        const buttonElement = screen.getByText("Start game")
        act(() => {
            Simulate.click(buttonElement)
        })

        expect(mockOnStartGame).toHaveBeenCalled()
    })

    test("Prints selected rounds correctly", () => {
        render(
            <StartGame
                completedSteps={[true, true, true, true]}
                selectedTheme="Train"
                selectedStudy="CSE"
                selectedRounds={["First", "Second", "Third"]}
                onStartGame={mockOnStartGame}
            ></StartGame>
        )

        const roundsText = screen.getByText("First, Second and Third", {
            exact: false,
        })

        expect(roundsText).toBeInTheDocument()
    })

    test("Disables button and displays correctly when theme not selected", () => {
        render(
            <StartGame
                completedSteps={[true, false, true, true]}
                selectedTheme="Train"
                selectedStudy="CSE"
                selectedRounds={["First", "Second"]}
                onStartGame={mockOnStartGame}
            ></StartGame>
        )

        const themeNotSelectedElement = screen.getByText(
            "You have not selected a theme."
        )
        const themeElement = screen.queryByText("Selected theme: Train")
        const studyElement = screen.getByText("Selected study: CSE")
        const roundsElement = screen.getByText(
            "Selected rounds: First and Second"
        )
        const buttonElement = screen.getByText("Start game")

        act(() => {
            Simulate.click(buttonElement)
        })

        expect(buttonElement).toHaveAttribute("disabled")
        expect(mockOnStartGame).not.toHaveBeenCalled()

        expect(themeElement).toBeNull()

        expect(themeNotSelectedElement).toBeInTheDocument()
        expect(studyElement).toBeInTheDocument()
        expect(roundsElement).toBeInTheDocument()
    })

    test("Disables button and displays correctly when study not selected", () => {
        render(
            <StartGame
                completedSteps={[true, true, false, true]}
                selectedTheme="Train"
                selectedStudy="CSE"
                selectedRounds={["First", "Second"]}
                onStartGame={mockOnStartGame}
            ></StartGame>
        )

        const studyNotSelected = screen.getByText(
            "You have not selected a study."
        )
        const themeElement = screen.getByText("Selected theme: Train")
        const studyElement = screen.queryByText("Selected study: CSE")
        const roundsElement = screen.getByText(
            "Selected rounds: First and Second"
        )
        const buttonElement = screen.getByText("Start game")

        act(() => {
            Simulate.click(buttonElement)
        })

        expect(buttonElement).toHaveAttribute("disabled")
        expect(mockOnStartGame).not.toHaveBeenCalled()

        expect(studyElement).toBeNull()

        expect(studyNotSelected).toBeInTheDocument()
        expect(themeElement).toBeInTheDocument()
        expect(roundsElement).toBeInTheDocument()
    })

    test("Disables button and displays correctly when rounds not selected", () => {
        render(
            <StartGame
                completedSteps={[true, true, true, false]}
                selectedTheme="Train"
                selectedStudy="CSE"
                selectedRounds={["First", "Second"]}
                onStartGame={mockOnStartGame}
            ></StartGame>
        )

        const roundsNotSelected = screen.getByText(
            "You have not selected any rounds."
        )
        const themeElement = screen.getByText("Selected theme: Train")
        const studyElement = screen.getByText("Selected study: CSE")
        const roundsElement = screen.queryByText(
            "Selected rounds: First and Second"
        )
        const buttonElement = screen.getByText("Start game")

        act(() => {
            Simulate.click(buttonElement)
        })

        expect(buttonElement).toHaveAttribute("disabled")
        expect(mockOnStartGame).not.toHaveBeenCalled()

        expect(roundsElement).toBeNull()

        expect(roundsNotSelected).toBeInTheDocument()
        expect(themeElement).toBeInTheDocument()
        expect(studyElement).toBeInTheDocument()
    })
})
