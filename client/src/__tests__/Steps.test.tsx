import { render, screen } from "@testing-library/react"
import React from "react"
import Steps from "../components/CreateGame/Lobby/Steps/Steps"

describe("Steps component tests", () => {
    const mockOnNameSelected = jest.fn((name: string) => name)
    const mockStartGameHandler = jest.fn(
        (
            selectedRounds: string[],
            selectedStudy: string,
            selectedTheme: string
        ) => [selectedRounds, selectedStudy, selectedTheme]
    )

    test("Displays all steps", () => {
        render(
            <Steps
                lobbyId={1111}
                onNameSelected={mockOnNameSelected}
                startGameHandler={mockStartGameHandler}
            ></Steps>
        )

        const step1 = screen.getByText("Select a name", { exact: false })
        const step2 = screen.getByText("Select a theme", { exact: false })
        const step3 = screen.getByText("Select a study", { exact: false })
        const step4 = screen.getByText("Select rounds", { exact: false })
        const step5 = screen.getByText("Start!", { exact: false })

        expect(step1).toBeInTheDocument()
        expect(step2).toBeInTheDocument()
        expect(step3).toBeInTheDocument()
        expect(step4).toBeInTheDocument()
        expect(step5).toBeInTheDocument()
    })
})
