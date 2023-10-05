import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import TeamInformation from "../components/CreateGame/Lobby/TeamInformation/TeamInformation"

describe("TeamInformation test", () => {
    test("displays the default team name and player count", () => {
        const onTeamNameCreatedMock = jest.fn()
        const playerNumber = 5
        render(
            <TeamInformation playerNumber={playerNumber} teamName={"test"} />
        )

        const teamNameElement = screen.getByText(/Team name:/)
        const playerCountElement = screen.getByText(`${playerNumber} players`)

        expect(teamNameElement).toBeInTheDocument()
        expect(playerCountElement).toBeInTheDocument()
    })
})
