import { act, screen } from "@testing-library/react"
import Lobby from "../components/CreateGame/Lobby/Lobby"
import { listenerCount, serverEmit } from "../test/mockSocket"
import { renderWithProviders } from "../test/renderWithProviders"

// The setup steps are tested on their own; here they would only add noise.
vi.mock("../components/CreateGame/Lobby/Steps/Steps", () => ({
    default: () => null,
}))

function renderLobby(lobbyId: number) {
    return renderWithProviders(
        <Lobby
            lobbyId={lobbyId}
            onThemeSelected={vi.fn()}
            onTeamNameCreated={vi.fn()}
            onStudySelected={vi.fn()}
        />,
        { route: "/Lobby" }
    )
}

describe("Lobby", () => {
    test.each([
        [1111, "1111"],
        [1, "0001"],
        [42, "0042"],
    ])("shows lobby id %d as code %s", (lobbyId, code) => {
        renderLobby(lobbyId)

        expect(screen.getByText(code)).toBeInTheDocument()
    })

    test("updates the player count when players join", () => {
        renderLobby(1111)
        expect(screen.getByText("0 players")).toBeInTheDocument()
        expect(listenerCount("new-player-joined")).toBe(1)

        act(() => serverEmit("new-player-joined", 3))

        expect(screen.getByText("3 players")).toBeInTheDocument()
    })
})
