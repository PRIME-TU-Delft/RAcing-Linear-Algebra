import { render, screen } from "@testing-library/react"
import React, { useState } from "react"
import Lobby from "../components/CreateGame/Lobby/Lobby"
import { BrowserRouter as Router } from "react-router-dom"

describe("Lobby component tests", () => {
    const teamNameHandler = (name: string) => {
        console.log(name)
    }
    test("Lobby code displayed correctly", () => {
        jest.mock(
            "../components/CreateGame/Lobby/TeamInformation/TeamInformation"
        )
        jest.mock("../components/CreateGame/Lobby/Steps/Steps")

        render(
            <Router>
                <Lobby
                    onThemeSelected={() => null}
                    lobbyId={1111}
                    onTeamNameCreated={(name: string) => teamNameHandler(name)}
                ></Lobby>
            </Router>
        )

        const lobbyCodeElement = screen.getByText("1111", { exact: false })
        expect(lobbyCodeElement).toBeInTheDocument()
    })

    test("Lobby code when padding is necessary displayed correctly", () => {
        jest.mock(
            "../components/CreateGame/Lobby/TeamInformation/TeamInformation"
        )
        jest.mock("../components/CreateGame/Lobby/Steps/Steps")

        render(
            <Router>
                <Lobby
                    lobbyId={1}
                    onThemeSelected={() => null}
                    onTeamNameCreated={(name: string) => teamNameHandler(name)}
                ></Lobby>
            </Router>
        )

        const lobbyCodeElement = screen.getByText("0001", { exact: false })
        expect(lobbyCodeElement).toBeInTheDocument()
    })
})
