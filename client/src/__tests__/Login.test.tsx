import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import Login from "../components/CreateGame/Login/Login"
import { mockSocket, serverEmit } from "../test/mockSocket"
import { renderWithProviders } from "../test/renderWithProviders"

function submitPassword(password: string) {
    fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: password },
    })
    fireEvent.click(screen.getByTestId("login-button"))
}

describe("Login", () => {
    test("back button navigates home", () => {
        const { getPathname } = renderWithProviders(
            <Login onLobbyIdCreated={vi.fn()} />,
            { route: "/CreateGame" }
        )

        fireEvent.click(screen.getByText("←"))

        expect(getPathname()).toBe("/")
    })

    test("clicking login sends the password to the server", () => {
        renderWithProviders(<Login onLobbyIdCreated={vi.fn()} />)

        submitPassword("test-password")

        expect(mockSocket.emit).toHaveBeenCalledWith(
            "authenticate",
            "test-password"
        )
    })

    test("shows an error when the server rejects the password", () => {
        renderWithProviders(<Login onLobbyIdCreated={vi.fn()} />)

        submitPassword("wrong")
        act(() => serverEmit("authenticated", false))

        expect(screen.getByTestId("message")).toHaveTextContent(
            "Wrong password"
        )
    })

    test("creates a lobby and opens it when the server accepts the password", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(JSON.stringify([1234]))
        )
        const onLobbyIdCreated = vi.fn()
        const { getPathname } = renderWithProviders(
            <Login onLobbyIdCreated={onLobbyIdCreated} />,
            { route: "/CreateGame" }
        )

        submitPassword("test-password")
        act(() => serverEmit("authenticated", true))

        await waitFor(() => expect(getPathname()).toBe("/Lobby"))
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/lobby/create"),
            expect.anything()
        )
        expect(mockSocket.emit).toHaveBeenCalledWith("createLobby", 1234)
        expect(onLobbyIdCreated).toHaveBeenCalledWith(1234)
        expect(screen.getByTestId("message")).toHaveTextContent("")
    })
})
