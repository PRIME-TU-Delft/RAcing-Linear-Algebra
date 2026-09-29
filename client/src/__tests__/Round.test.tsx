import { fireEvent, render, screen } from "@testing-library/react"
import Round from "../components/CreateGame/Lobby/Rounds/Round/Round"

describe("Round", () => {
    test("shows the topic, its initial and its 1-based position", () => {
        render(
            <Round topic="eigenvalues" onSelectRound={vi.fn()} selected={false} index={2} />
        )

        expect(screen.getByText("eigenvalues")).toBeInTheDocument()
        expect(screen.getByText("E")).toBeInTheDocument()
        expect(screen.getByText("3")).toBeInTheDocument()
    })

    test("uses a smaller font for topics longer than 20 characters", () => {
        render(
            <Round
                topic="TOPICTOPICTOPICTOPICC"
                onSelectRound={vi.fn()}
                selected={false}
                index={0}
            />
        )

        expect(screen.getByText("TOPICTOPICTOPICTOPICC")).toHaveClass(
            "long-topic-name"
        )
    })

    test.each([
        [false, true],
        [true, false],
    ])("clicking a round with selected=%s requests selected=%s", (selected, requested) => {
        const onSelectRound = vi.fn()
        render(
            <Round topic="Determinants" onSelectRound={onSelectRound} selected={selected} index={0} />
        )

        fireEvent.click(screen.getByText("Determinants"))

        expect(onSelectRound).toHaveBeenCalledWith("Determinants", requested)
    })
})
