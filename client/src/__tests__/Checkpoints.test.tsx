import React from "react"
import { render, screen } from "@testing-library/react"
import Checkpoints from "../components/RaceThemes/Checkpoints/Checkpoints"
import { Component, Point } from "../components/RaceThemes/SharedUtils"

describe("Checkpoints component tests", () => {
    const componentVerticalDown: Component = new Component(
        new Point(200, 200),
        new Point(200, 2),
        "vertical"
    )

    const checkpoints = [
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

    test("All checkpoints displayed", () => {
        render(
            <Checkpoints
                checkpoints={checkpoints}
                sprite=""
                totalPoints={500}
                pathLength={1000}
                components={[componentVerticalDown]}
            />
        )

        const delft = screen.findByTestId("checkpoint0")
        const rotterdam = screen.findByTestId("checkpoint1")
        const eindhoven = screen.findByTestId("checkpoint2")

        expect(delft).not.toBeNull()
        expect(rotterdam).not.toBeNull()
        expect(eindhoven).not.toBeNull()
    })
})
