import React from "react"
import { render, screen } from "@testing-library/react"
import Path from "../components/RaceThemes/BoatTheme/Path/Path"

describe("Path component tests", () => {
    const dimensions = { width: innerWidth, height: innerHeight }
    const mockOnSectionComplete = jest.fn()
    const ghosts = [
        { score: 700, teamName: "Devs" },
        {
            score: 300,
            teamName: "AverageJoes",
        },
    ]

    const islands = [
        {
            name: "Solitude Island",
            points: 150,
        },
        {
            name: "Mystic Isle",
            points: 300,
        },
        {
            name: "Hidden Oasis",
            points: 450,
        },
    ]

    test("Section complete called", () => {
        render(
            <Path
                mapDimensions={dimensions}
                trackPoints={[
                    { xPercent: 0.5, yPercent: 0 },
                    { xPercent: 0.5, yPercent: 1 },
                ]}
                totalPoints={500}
                currentPoints={0}
                checkpoints={islands}
                ghostBoats={ghosts}
                finalSection={false}
                onSectionComplete={mockOnSectionComplete}
            />
        )

        expect(mockOnSectionComplete).not.toHaveBeenCalled()

        render(
            <Path
                mapDimensions={dimensions}
                trackPoints={[
                    { xPercent: 0.5, yPercent: 0 },
                    { xPercent: 0.5, yPercent: 1 },
                ]}
                totalPoints={500}
                currentPoints={500}
                checkpoints={islands}
                ghostBoats={ghosts}
                finalSection={false}
                onSectionComplete={mockOnSectionComplete}
            />
        )

        expect(mockOnSectionComplete).toHaveBeenCalled()
    })

    test("Displays ghost boats for first section", () => {
        render(
            <Path
                mapDimensions={dimensions}
                trackPoints={[
                    { xPercent: 0.5, yPercent: 0 },
                    { xPercent: 0.5, yPercent: 1 },
                ]}
                totalPoints={500}
                currentPoints={0}
                checkpoints={islands}
                ghostBoats={ghosts}
                finalSection={false}
                onSectionComplete={mockOnSectionComplete}
            />
        )

        const ghostTrains = screen.findByTestId("ghosts")
        const bestGhost = screen.queryByTestId("best-ghost")

        expect(ghostTrains).not.toBeNull()
        expect(bestGhost).toBeNull()
    })

    test("Displays best ghost for final section", () => {
        render(
            <Path
                mapDimensions={dimensions}
                trackPoints={[
                    { xPercent: 0.5, yPercent: 0 },
                    { xPercent: 0.5, yPercent: 1 },
                ]}
                totalPoints={500}
                currentPoints={0}
                checkpoints={islands}
                ghostBoats={ghosts}
                finalSection={true}
                onSectionComplete={mockOnSectionComplete}
            />
        )

        const ghostTrains = screen.queryByTestId("ghosts")
        const bestGhost = screen.findByTestId("best-ghost")

        expect(ghostTrains).toBeNull()
        expect(bestGhost).not.toBeNull()
    })

    test("Displays main boat", () => {
        render(
            <Path
                mapDimensions={dimensions}
                trackPoints={[
                    { xPercent: 0.5, yPercent: 0 },
                    { xPercent: 0.5, yPercent: 1 },
                ]}
                totalPoints={500}
                currentPoints={0}
                checkpoints={islands}
                ghostBoats={ghosts}
                finalSection={false}
                onSectionComplete={mockOnSectionComplete}
            />
        )

        const mainTrain = screen.findByTestId("main-train")
        expect(mainTrain).not.toBeNull()
    })
})
