import { render, screen } from "@testing-library/react"
import TeamInformation from "../components/CreateGame/Lobby/TeamInformation/TeamInformation"

describe("TeamInformation", () => {
    test("shows the team name", () => {
        render(<TeamInformation playerNumber={5} teamName="Vectors" />)

        expect(screen.getByText("Vectors")).toBeInTheDocument()
    })

    test.each([
        [0, "0 players"],
        [1, "1 player"],
        [5, "5 players"],
    ])("shows %d players as %j", (playerNumber, text) => {
        render(
            <TeamInformation playerNumber={playerNumber} teamName="Vectors" />
        )

        expect(screen.getByText(text)).toBeInTheDocument()
    })
})
