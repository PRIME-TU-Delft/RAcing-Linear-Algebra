import React from "react"
import Tooltip from "../components/Waiting/Tooltip"
import { fireEvent, render, screen } from "@testing-library/react"

describe("Tooltip component tests", () => {
    beforeEach(() => {
        render(<Tooltip />)
    })

    test("First tip renders correctly", () => {
        const tooltip = screen.getByText(
            "It is reccomended to play on a desktop, laptop or tablet"
        )
        expect(tooltip).toBeInTheDocument()
    })

    test("Second tip renders correctly", () => {
        const tooltip = screen.getByText(
            "It is reccomended to play on a desktop, laptop or tablet"
        )
        setTimeout(() => {
            expect(tooltip).toHaveTextContent(
                "The beggining of each round is composed of a set mandatory questions that everyone has to answer"
            )
        }, 5000)
    })

    test("Arrows switch tips correctly", () => {
        const tooltip = screen.getByText(
            "It is reccomended to play on a desktop, laptop or tablet"
        )
        const leftArrow = screen.getByTestId("tooltip-left-arrow")
        const rightArrow = screen.getByTestId("tooltip-right-arrow")
        fireEvent.click(leftArrow)
        expect(tooltip).toHaveTextContent(
            "You will be competing against other classrooms, so try and help each other as much as possible"
        )
        fireEvent.click(leftArrow)
        expect(tooltip).toHaveTextContent(
            "Answering multiple questions right in a row will provide you with bonus points"
        )
        fireEvent.click(rightArrow)
        expect(tooltip).toHaveTextContent(
            "You will be competing against other classrooms, so try and help each other as much as possible"
        )
    })
})
