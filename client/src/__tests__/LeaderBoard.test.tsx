import React from "react"
import { render, screen } from "@testing-library/react"
import LeaderBoard from "../components/CreateGame/Lecturer/LeaderBoard/Leaderboard"

describe("LeaderBoard component", () => {
    const teamName = "Your Team"
    const yourScore = 270
    const yourAccuracy = 86
    const yourCheckPoint = "Delft"
    const teams = [
        { name: "Team 1", score: 100, accuracy: 85, checkpoint: "A" },
        { name: "Team 2", score: 200, accuracy: 75, checkpoint: "B" },
        {
            name: teamName,
            score: yourScore,
            accuracy: yourAccuracy,
            checkpoint: yourCheckPoint,
        },
        // Add more team data as needed
    ]
    test("renders the leaderboard table with correct data", () => {
        render(
            <LeaderBoard
                teamname={teamName}
                yourScore={yourScore}
                yourAccuracy={yourAccuracy}
                yourCheckPoint={yourCheckPoint}
                teams={teams}
            />
        )

        // Assert that the leaderboard title is rendered
        const leaderboardTitle = screen.getByText("Leaderboard")
        expect(leaderboardTitle).toBeInTheDocument()

        // Assert that the leaderboard table is rendered
        const leaderboardTable = screen.getByRole("table")
        expect(leaderboardTable).toBeInTheDocument()
        expect(
            screen.getByText("Your Position:", { exact: false })
        ).toHaveTextContent("Your Position: 1")
        // Assert the content of table headers
        const tableHeaders = screen.getAllByRole("columnheader")
        expect(tableHeaders).toHaveLength(5) // Assumes there are five columns
        expect(tableHeaders[0]).toHaveTextContent("Rank")
        expect(tableHeaders[1]).toHaveTextContent("Name")
        expect(tableHeaders[2]).toHaveTextContent("Accuracy")
        expect(tableHeaders[3]).toHaveTextContent("Checkpoint")
        expect(tableHeaders[4]).toHaveTextContent("Score")
        // Assert that team data is rendered correctly
        expect(screen.getByText("1")).toBeInTheDocument()
        expect(screen.getByText("Team 1")).toBeInTheDocument()
        expect(screen.getByText("85%")).toBeInTheDocument()
        expect(screen.getByText("A")).toBeInTheDocument()
        expect(screen.getByText("100")).toBeInTheDocument()
        // Assert that the highlighted row is applied to the correct team
        expect(screen.getByText("Your Team").parentElement).toHaveClass(
            "highlighted-row"
        )
    })
})
