import React from "react"
import Question from "../components/Questions/Question"
import { render, screen } from "@testing-library/react"
import { BrowserRouter as Router } from "react-router-dom"
import { renderLatex } from "../components/Questions/useRenderLatex"

describe("Question component tests", () => {
    test("Boat theme renders correctly", () => {
        render(
            <Router>
                <Question theme="Boat" />
            </Router>
        )
        const boatTheme = screen.getByTestId("boat-background-question")
        expect(boatTheme).toBeInTheDocument()
        const trainTheme = screen.queryByTestId("train-background-question")
        expect(trainTheme).not.toBeInTheDocument()
    })

    test("Train theme renders correctly", () => {
        render(
            <Router>
                <Question theme="Train" />
            </Router>
        )
        const trainTheme = screen.getByTestId("train-background-question")
        expect(trainTheme).toBeInTheDocument()
        const boatTheme = screen.queryByTestId("boat-background-question")
        expect(boatTheme).not.toBeInTheDocument()
    })

    test("Latex renders correctly", () => {
        const nothingString = renderLatex("Nothing")
        expect(nothingString).toBe("Nothing")
        const fraction = renderLatex("$$\\frac{1}{2}$$")
        expect(fraction).toBe(
            '<span class="katex"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>1</mn><mn>2</mn></mfrac></mrow><annotation encoding="application/x-tex">\\frac{1}{2}</annotation></semantics></math></span>'
        )
    })
})
