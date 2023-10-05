import React from "react"
import { render, screen } from "@testing-library/react"
import BestGhost from "../components/RaceThemes/Ghosts/BestGhost"

describe("Best ghost component tests", () => {
    const ghost = { score: 700, teamName: "Devs" }

    test("F", () => {
        render(
            <BestGhost bestGhost={ghost} totalPoints={500} path="" sprite="" />
        )

        const devs = screen.findByText("Devs")
        expect(devs).not.toBeNull()
    })
})
