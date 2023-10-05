import { render, screen } from "@testing-library/react"
import React from "react"
import StationDisplay from "../components/RaceThemes/TrainTheme/StationDisplay/StationDisplay"

describe("Station display component tests", () => {
    const stations = [
        {
            name: "Delft",
            points: 150,
        },
        {
            name: "Rotterdam Centraal",
            points: 300,
        },
    ]

    test("Correctly displays first checkpoint", () => {
        render(<StationDisplay stations={stations} points={0}></StationDisplay>)

        const first = screen.getByTestId("scheduleStation0")
        const second = screen.getByTestId("scheduleStation1")

        expect(first).not.toHaveClass("station")
        expect(first).toHaveClass("active-station")
        expect(second).not.toHaveClass("active-station")
        expect(second).toHaveClass("station")
    })

    test("Correctly updates checkpoints when points are added", () => {
        render(
            <StationDisplay stations={stations} points={200}></StationDisplay>
        )

        const first = screen.getByTestId("scheduleStation0")
        const second = screen.queryByTestId("scheduleStation1")

        expect(first).not.toHaveClass("station")
        expect(first).toHaveClass("active-station")
        expect(second).toBeNull()
    })
})
