import { act, render, screen } from "@testing-library/react"
import React from "react"
import Step from "../components/CreateGame/Lobby/Steps/Step/Step"
import { Simulate } from "react-dom/test-utils"

describe("Step component tests", () => {
    const mockOnStepSelected = jest.fn((stepNumber: number) => stepNumber)

    test("Step selection on click works correctly", () => {
        render(
            <Step
                stepNumber={1}
                onStepSelected={mockOnStepSelected}
                stepTitle={"Test"}
                stepCaption={"Test description"}
                stepContent={<div></div>}
                stepActive={true}
                stepCompleted={false}
            ></Step>
        )

        const stepElement = screen.getByText("Test")
        act(() => {
            Simulate.click(stepElement)
        })

        expect(mockOnStepSelected.mock.calls[0][0]).toBe(1)
    })
})
