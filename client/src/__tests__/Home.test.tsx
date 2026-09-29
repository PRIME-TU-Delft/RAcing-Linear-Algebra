import { fireEvent, screen } from "@testing-library/react"
import Home from "../components/Home/Home"
import { renderWithProviders } from "../test/renderWithProviders"

describe("Home", () => {
    test("renders the title and both entry buttons", () => {
        renderWithProviders(<Home loggedIn={false} />)

        expect(screen.getByText("Racing LAB")).toBeInTheDocument()
        expect(screen.getByText("Create Game")).toBeInTheDocument()
        expect(screen.getByText("Join Game")).toBeInTheDocument()
    })

    test.each([
        ["Create Game", "/CreateGame"],
        ["Join Game", "/JoinGame"],
    ])("%s navigates to %s", (button, path) => {
        const { getPathname } = renderWithProviders(<Home loggedIn={false} />)

        fireEvent.click(screen.getByText(button))

        expect(getPathname()).toBe(path)
    })
})
