import React from "react"
import { render, screen } from "@testing-library/react"
import Ghosts from "../components/RaceThemes/Ghosts/Ghosts"

describe("Ghosts component tests", () => {
    const ghosts = [
        { score: 700, teamName: "Devs" },
        {
            score: 300,
            teamName: "AverageJoes",
        },
    ]

    test("All ghosts displayed properly", () => {
        render(
            <Ghosts
                ghosts={ghosts}
                totalPoints={500}
                colors={["#FFFFF", "#0000"]}
                path=""
                sprite=""
            />
        )

        const devs = screen.findByText("Devs")
        const average = screen.findByText("AverageJoes")

        expect(devs).not.toBeNull()
        expect(average).not.toBeNull()
    })
})
