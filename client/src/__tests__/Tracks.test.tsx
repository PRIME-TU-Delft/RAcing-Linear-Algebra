import React from "react"
import { render, screen } from "@testing-library/react"
import Tracks from "../components/RaceThemes/TrainTheme/Tracks/Tracks"

describe("Tracks component tests", () => {
    const dimensions = { width: innerWidth, height: innerHeight }
    const mockOnSectionComplete = jest.fn()
    const ghosts = [
        { score: 700, teamName: "Devs" },
        {
            score: 300,
            teamName: "AverageJoes",
        },
    ]

    const stations = [
        {
            name: "Delft",
            points: 150,
        },
        {
            name: "Rotterdam Centraal",
            points: 300,
        },
        {
            name: "Eindhoven Centraal",
            points: 450,
        },
    ]

    test("Section complete called", () => {
        render(
            <Tracks
                mapDimensions={dimensions}
                trackPoints={[
                    { xPercent: 0.5, yPercent: 0 },
                    { xPercent: 0.5, yPercent: 1 },
                ]}
                totalPoints={500}
                currentPoints={0}
                checkpoints={stations}
                ghostTrains={ghosts}
                finalSection={false}
                onSectionComplete={mockOnSectionComplete}
            />
        )

        expect(mockOnSectionComplete).not.toHaveBeenCalled()

        render(
            <Tracks
                mapDimensions={dimensions}
                trackPoints={[
                    { xPercent: 0.5, yPercent: 0 },
                    { xPercent: 0.5, yPercent: 1 },
                ]}
                totalPoints={500}
                currentPoints={500}
                checkpoints={stations}
                ghostTrains={ghosts}
                finalSection={false}
                onSectionComplete={mockOnSectionComplete}
            />
        )

        expect(mockOnSectionComplete).toHaveBeenCalled()
    })

    test("Displays ghost trains for first section", () => {
        render(
            <Tracks
                mapDimensions={dimensions}
                trackPoints={[
                    { xPercent: 0.5, yPercent: 0 },
                    { xPercent: 0.5, yPercent: 1 },
                ]}
                totalPoints={500}
                currentPoints={0}
                checkpoints={stations}
                ghostTrains={ghosts}
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
            <Tracks
                mapDimensions={dimensions}
                trackPoints={[
                    { xPercent: 0.5, yPercent: 0 },
                    { xPercent: 0.5, yPercent: 1 },
                ]}
                totalPoints={500}
                currentPoints={0}
                checkpoints={stations}
                ghostTrains={ghosts}
                finalSection={true}
                onSectionComplete={mockOnSectionComplete}
            />
        )

        const ghostTrains = screen.queryByTestId("ghosts")
        const bestGhost = screen.findByTestId("best-ghost")

        expect(ghostTrains).toBeNull()
        expect(bestGhost).not.toBeNull()
    })

    test("Displays main train", () => {
        render(
            <Tracks
                mapDimensions={dimensions}
                trackPoints={[
                    { xPercent: 0.5, yPercent: 0 },
                    { xPercent: 0.5, yPercent: 1 },
                ]}
                totalPoints={500}
                currentPoints={0}
                checkpoints={stations}
                ghostTrains={ghosts}
                finalSection={false}
                onSectionComplete={mockOnSectionComplete}
            />
        )

        const mainTrain = screen.findByTestId("main-train")
        expect(mainTrain).not.toBeNull()
    })
})
