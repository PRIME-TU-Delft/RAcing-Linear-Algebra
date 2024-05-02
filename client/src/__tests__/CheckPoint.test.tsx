import React from "react"
import { render, screen } from "@testing-library/react"
import CheckPoint from "../components/CreateGame/Lecturer/CheckPoint"

describe("CheckPoint component", () => {
    const mockProps = {
        location: "Checkpoint A",
        teamName: "Team A",
        score: 500,
        minutes: 5,
        seconds: 30,
        teams: [
            {
                teamName: "Team C",
                teamMinutes: 7,
                teamSeconds: 30,
            },
            {
                teamName: "Team B",
                teamMinutes: 6,
                teamSeconds: 0,
            },
            // Add more team objects as needed
        ],
    }

    test("renders CheckPoint component with correct data", () => {
        const { getByText } = render(<CheckPoint {...mockProps} />)

        // Check if the component renders the location correctly
        expect(
            getByText("You have reached:", { exact: false })
        ).toBeInTheDocument()
        expect(getByText("Checkpoint A", { exact: false })).toBeInTheDocument()

        // Check if the component renders the arrival time correctly
        expect(
            getByText("Your Time Taken:", { exact: false })
        ).toHaveTextContent("05:30")

        // Check if the component renders the current position correctly
        expect(
            getByText("Current Position: 1", { exact: false })
        ).toBeInTheDocument()

        // Check if the component renders the team name and arrival time in the table correctly

        const teamNameElements = screen.getAllByText("Team A", { exact: false })
        const teamScoreElements = screen.getAllByText("05:30", { exact: false })

        expect(teamNameElements.length).toBeGreaterThan(0)
        expect(teamNameElements[0]).toBeInTheDocument()
        expect(teamScoreElements.length).toBeGreaterThan(1)
        expect(teamScoreElements[0]).toBeInTheDocument()
        expect(teamScoreElements[1]).toBeInTheDocument()
        // Add more assertions as needed for other elements and data
    })
})
