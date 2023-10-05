import { render, screen } from "@testing-library/react"
import React from "react"
import Round from "../components/CreateGame/Lobby/Rounds/Round/Round"

describe("Round component tests", () => {
    const mockOnSelectRound = jest.fn(
        (title: string, selected: boolean) => title
    )

    test("Renders round information correctly", () => {
        render(<Round topic="TOPIC" onSelectRound={mockOnSelectRound}></Round>)

        const round = screen.findByText("TOPIC")
        expect(round).not.toBeNull()
    })

    test("Renders long round topic with smaller font", async () => {
        render(
            <Round
                topic="TOPICTOPICTOPICTOPICC" // length > 20
                onSelectRound={mockOnSelectRound}
            ></Round>
        )

        const round = await screen.findByText("TOPICTOPICTOPICTOPICC")
        expect(round).not.toBeNull()
        expect(round).toHaveClass("long-topic-name")
    })
})
