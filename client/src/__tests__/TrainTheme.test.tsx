import { render, screen } from "@testing-library/react"
import React from "react"
import TrainTheme from "../components/RaceThemes/TrainTheme/TrainTheme"

describe("Train theme tests", () => {
    const dimensions = { width: innerWidth, height: innerHeight }
    const mockSetCheckpoint = jest.fn((data: string) => data)
    const mockShowCheckpoint = jest.fn()

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

    const ghosts = [
        { score: 700, teamName: "Devs" },
        {
            score: 300,
            teamName: "AverageJoes",
        },
    ]

    test("Correctly loads first map section", () => {
        render(
            <TrainTheme
                ghosts={ghosts}
                mapDimensions={dimensions}
                maxPoints={1000}
                averageGoalPoints={500}
                currentPoints={0}
                checkpoints={stations}
                usedTime={0}
                setCheckpoint={mockSetCheckpoint}
                showCheckPoint={mockShowCheckpoint}
            />
        )

        const firstSection = screen.getByTestId(0)
        const secondSection = screen.queryByTestId(1)

        expect(firstSection).toBeInTheDocument()
        expect(secondSection).not.toBeInTheDocument()
    })

    test("Correctly loads second map section", () => {
        render(
            <TrainTheme
                ghosts={ghosts}
                mapDimensions={dimensions}
                maxPoints={1000}
                averageGoalPoints={500}
                currentPoints={600}
                checkpoints={stations}
                usedTime={0}
                setCheckpoint={mockSetCheckpoint}
                showCheckPoint={mockShowCheckpoint}
            />
        )

        const firstSection = screen.queryByTestId(0)
        const secondSection = screen.getByTestId(1)

        expect(firstSection).not.toBeInTheDocument()
        expect(secondSection).toBeInTheDocument()
    })

    test("Checkpoint reached called correctly", () => {
        render(
            <TrainTheme
                ghosts={ghosts}
                mapDimensions={dimensions}
                maxPoints={1000}
                averageGoalPoints={500}
                currentPoints={0}
                checkpoints={stations}
                usedTime={0}
                setCheckpoint={mockSetCheckpoint}
                showCheckPoint={mockShowCheckpoint}
            />
        )

        expect(mockSetCheckpoint).not.toHaveBeenCalled()
        expect(mockShowCheckpoint).not.toHaveBeenCalled()

        render(
            <TrainTheme
                ghosts={ghosts}
                mapDimensions={dimensions}
                maxPoints={1000}
                averageGoalPoints={500}
                currentPoints={150}
                checkpoints={stations}
                usedTime={0}
                setCheckpoint={mockSetCheckpoint}
                showCheckPoint={mockShowCheckpoint}
            />
        )

        expect(mockSetCheckpoint).toHaveBeenCalled()
        expect(mockSetCheckpoint.mock.calls[0][0]).toBe("Delft")
        setTimeout(() => {
            expect(mockShowCheckpoint).toHaveBeenCalled()
        }, 3000)
    })
})
