import { fireEvent, render, screen } from "@testing-library/react"
import Step from "../components/CreateGame/Lobby/Steps/Step/Step"

describe("Step", () => {
    test("clicking the step reports its number", () => {
        const onStepSelected = vi.fn()
        render(
            <Step
                stepNumber={1}
                onStepSelected={onStepSelected}
                stepTitle="Test"
                stepCaption="Test description"
                stepContent={<div />}
                stepActive={true}
                stepCompleted={false}
            />
        )

        fireEvent.click(screen.getByText("Test"))

        expect(onStepSelected).toHaveBeenCalledWith(1)
    })
})
