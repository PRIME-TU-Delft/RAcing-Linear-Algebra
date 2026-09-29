import { fireEvent, screen, waitFor } from "@testing-library/react"
import JoinGame from "../components/JoinGame/JoinGame"
import { mockSocket } from "../test/mockSocket"
import { renderWithProviders } from "../test/renderWithProviders"

const INVALID_FORMAT = "The code should be a 4 digit number!"

function renderJoinGame(onLobbyJoined = vi.fn()) {
    return renderWithProviders(
        <JoinGame onLobbyJoined={onLobbyJoined} reconnectionAvailableTime={0} />,
        { route: "/JoinGame" }
    )
}

function submitCode(code: string) {
    fireEvent.change(screen.getByPlaceholderText("E.g. 1217"), {
        target: { value: code },
    })
    fireEvent.click(screen.getByText("Join"))
}

describe("JoinGame", () => {
    test("renders the instructions and no error initially", () => {
        renderJoinGame()

        expect(
            screen.getByText("Join the game using the code from your lecturer!")
        ).toBeInTheDocument()
        expect(screen.queryByText(INVALID_FORMAT)).toBeNull()
    })

    test.each(["abc", "123", "12345"])(
        "rejects %j without asking the server",
        async (code) => {
            renderJoinGame()

            submitCode(code)

            expect(await screen.findByText(INVALID_FORMAT)).toBeInTheDocument()
            expect(fetch).not.toHaveBeenCalled()
        }
    )

    test("shows an error when the server says the lobby does not exist", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(new Response("false"))
        renderJoinGame()

        submitCode("1217")

        expect(
            await screen.findByText("Your lobby code is not valid!")
        ).toBeInTheDocument()
        expect(mockSocket.emit).not.toHaveBeenCalledWith(
            "joinLobby",
            expect.anything(),
            expect.anything()
        )
    })

    test("joins a valid lobby and goes to the waiting screen", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(new Response("true"))
        const onLobbyJoined = vi.fn()
        const { getPathname } = renderJoinGame(onLobbyJoined)

        submitCode("1217")

        await waitFor(() => expect(getPathname()).toBe("/Waiting"))
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/lobby/validate/1217"),
            expect.anything()
        )
        expect(mockSocket.emit).toHaveBeenCalledWith(
            "joinLobby",
            "1217",
            expect.any(String)
        )
        expect(onLobbyJoined).toHaveBeenCalledWith(1217)
    })

    test("back button navigates home", () => {
        const { getPathname } = renderJoinGame()

        fireEvent.click(screen.getByText("←"))

        expect(getPathname()).toBe("/")
    })
})
