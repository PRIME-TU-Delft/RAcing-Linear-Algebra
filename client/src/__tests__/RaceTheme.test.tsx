import React from "react"
import { render, screen } from "@testing-library/react"
import RaceTheme from "../components/RaceThemes/RaceTheme"

describe("Race theme component tests", () => {
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

    test("Train theme renders correctly", () => {
        render(
            <RaceTheme
                mapDimensions={dimensions}
                maxPoints={1000}
                averageGoalPoints={500}
                currentPoints={0}
                checkpoints={stations}
                usedTime={0}
                selectedTheme="train"
                setCheckpoint={mockSetCheckpoint}
                showCheckPoint={mockShowCheckpoint}
            />
        )

        const trainTheme = screen.findByTestId("train-theme")
        const boatTheme = screen.queryByTestId("boat-theme")

        expect(trainTheme).not.toBeNull()
        expect(boatTheme).toBeNull()
    })

    test("Boat theme renders correctly", () => {
        render(
            <RaceTheme
                mapDimensions={dimensions}
                maxPoints={1000}
                averageGoalPoints={500}
                currentPoints={0}
                checkpoints={stations}
                usedTime={0}
                selectedTheme="boat"
                setCheckpoint={mockSetCheckpoint}
                showCheckPoint={mockShowCheckpoint}
            />
        )

        const boatTheme = screen.findByTestId("boat-theme")
        const trainTheme = screen.queryByTestId("train-theme")

        expect(boatTheme).not.toBeNull()
        expect(trainTheme).toBeNull()
    })
})
