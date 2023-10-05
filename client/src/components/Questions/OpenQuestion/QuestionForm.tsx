import React, { RefObject } from "react"
import "./OpenQuestion.css"
import { useEffect, useRef, useState } from "react"
import { addStyles } from "react-mathquill"
import katex from "katex"
import "../../../utils/mathquill.min.js"
import socket from "../../../socket"

// Array containing all the symbols for the buttons
const buttonSymbols: string[] = [
    "\\frac{\\square}{\\square}",
    "\\sqrt{\\square}",
    "\\square^{\\square}",
    "\\square_{\\square}",
    "e^{\\square}",
    "\\neq",
    "\\lambda",
    "\\begin{bmatrix} \\square & \\square \\\\ \\square & \\square \\end{bmatrix} \\space \\blacktriangledown",
]

const modalButtonSymbols: string[] = [
    "\\begin{bmatrix} \\square \\\\ \\square \\end{bmatrix}",
    "\\begin{bmatrix} \\square \\\\ \\square \\\\ \\square \\end{bmatrix}",
    "\\begin{bmatrix} \\square & \\square \\\\ \\square & \\square \\end{bmatrix}",
    "\\begin{bmatrix} \\square & \\square & \\square \\\\ \\square & \\square & \\square \\\\ \\square & \\square & \\square \\end{bmatrix}",
]

// Mathquill input field
let mathField: any = null

interface Props {
    latex: string
    disableButton: boolean
    theme: string
}

function QuestionForm(props: Props) {
    const fractionButton: RefObject<HTMLButtonElement> =
        useRef<HTMLButtonElement>(null)
    const sqrtButton: RefObject<HTMLButtonElement> =
        useRef<HTMLButtonElement>(null)
    const powerButton: RefObject<HTMLButtonElement> =
        useRef<HTMLButtonElement>(null)
    const subscriptButton: RefObject<HTMLButtonElement> =
        useRef<HTMLButtonElement>(null)
    const eButton: RefObject<HTMLButtonElement> =
        useRef<HTMLButtonElement>(null)
    const matrixButton: RefObject<HTMLButtonElement> =
        useRef<HTMLButtonElement>(null)
    const mathFieldRef = useRef<HTMLInputElement>(null)
    const neqButton = useRef<HTMLButtonElement>(null)
    const lambdaButton = useRef<HTMLButtonElement>(null)

    const vector2by1 = useRef<HTMLButtonElement>(null)
    const vector3by1 = useRef<HTMLButtonElement>(null)
    const matrix2by2 = useRef<HTMLButtonElement>(null)
    const matrix3by3 = useRef<HTMLButtonElement>(null)

    // Array containing all the button refs
    const buttonArray: RefObject<HTMLButtonElement>[] = [
        fractionButton,
        sqrtButton,
        powerButton,
        subscriptButton,
        eButton,
        neqButton,
        lambdaButton,
        matrixButton,
    ]

    const modalButtonArray: RefObject<HTMLButtonElement>[] = [
        vector2by1,
        vector3by1,
        matrix2by2,
        matrix3by3,
    ]

    addStyles()

    // On first render load all the images for the buttons on the form
    useEffect(() => {
        let index = 0

        for (const button of buttonArray) {
            if (button.current) {
                button.current.innerHTML = renderLatex(buttonSymbols[index++])
            }
        }

        // On load also initialise the mathquill input field
        const MQ = window.MathQuill.getInterface(2)
        mathField = MQ.MathField(mathFieldRef.current)
        mathField.focus()
        return () => {
            // Clear the math field on component unmount
            mathField.latex("")
        }
    }, [props.latex])

    // Onclick function for the buttons that appends the math symbol in the input field
    const handleButtonClick = (textToAppend: string) => {
        mathField.write(textToAppend)
        mathField.focus() // Focus the input field after pressing button
    }

    // General use function for katex to render expressions, used for button icons
    function renderLatex(text: string): string {
        return katex.renderToString(text, {
            throwOnError: false,
            output: "mathml",
        })
    }

    // State for the matrix modal
    const [showMatrixModal, setShowMatrixModal] = useState(false)
    const [matrixRows, setMatrixRows] = useState(2)
    const [matrixColumns, setMatrixColumns] = useState(2)

    useEffect(() => {
        let index = 0

        for (const button of modalButtonArray) {
            if (button.current) {
                button.current.innerHTML = renderLatex(
                    modalButtonSymbols[index++]
                )
            }
        }
    }, [showMatrixModal])

    // Function that displays the matrix on the input according to the user input
    function matrixSubmit() {
        if (
            matrixRows <= 0 ||
            matrixColumns <= 0 ||
            matrixRows > 9 ||
            matrixColumns > 9
        ) {
            setShowMatrixModal(false)
            return
        }
        let textToAppend = "\\begin{bmatrix}"
        // Edge case for 1x? matrices
        if (matrixRows === 1) {
            for (let i = 0; i < matrixColumns - 1; i++) {
                textToAppend += "& "
            }
        }
        for (let i = 0; i < matrixRows - 1; i++) {
            for (let j = 0; j < matrixColumns - 1; j++) {
                textToAppend += "& "
            }
            textToAppend += "\\\\"
        }
        textToAppend += "\\end{bmatrix}"
        mathField.latex((mathField.latex() as string) + textToAppend)
        setShowMatrixModal(false)
    }

    function matrixSubmitParams(rows: number, columns: number) {
        let textToAppend = "\\begin{bmatrix}"
        // Edge case for 1x? matrices
        if (rows === 1) {
            for (let i = 0; i < columns - 1; i++) {
                textToAppend += "& "
            }
        }
        for (let i = 0; i < rows - 1; i++) {
            for (let j = 0; j < columns - 1; j++) {
                textToAppend += "& "
            }
            textToAppend += "\\\\"
        }
        textToAppend += "\\end{bmatrix}"
        mathField.latex((mathField.latex() as string) + textToAppend)
        setShowMatrixModal(false)
    }

    // Function that sends the answer to the backend for checking
    function checkAnswer() {
        socket.emit("checkAnswer", mathField.latex())
    }

    return (
        <>
            <form
                className={`question-form ${
                    props.theme === "Train"
                        ? "train-theme-form"
                        : "boat-theme-form"
                } `}
                onKeyDown={(e) => {
                    if (e.key == "Enter") checkAnswer()
                }}
            >
                <div className="math-field-container">
                    <span
                        ref={mathFieldRef}
                        className="answer-form"
                        id="answer-form"
                        data-testid="math-field"
                    ></span>
                    <button
                        className={`submit ${
                            props.theme === "Train"
                                ? "train-theme-submit"
                                : "boat-theme-submit"
                        }`}
                        type="button"
                        onClick={checkAnswer}
                        style={{
                            pointerEvents: props.disableButton
                                ? "none"
                                : "auto",
                        }}
                    >
                        Check answer
                    </button>
                </div>
                <div className="buttons-flexbox">
                    <button
                        className="mathquill-button screen-button"
                        id="fraction-button"
                        ref={fractionButton}
                        type="button"
                        onClick={() => handleButtonClick("\\frac{}{}")}
                        data-testid="fraction-button"
                    ></button>
                    <button
                        className="mathquill-button screen-button"
                        id="sqrt-button"
                        ref={sqrtButton}
                        type="button"
                        onClick={() => handleButtonClick("\\sqrt{}")}
                        data-testid="sqrt-button"
                    ></button>
                    <button
                        className="mathquill-button screen-button"
                        id="power-button"
                        ref={powerButton}
                        type="button"
                        onClick={() => handleButtonClick("^{}")}
                        data-testid="power-button"
                    ></button>
                    <button
                        className="mathquill-button screen-button"
                        id="subscript-button"
                        ref={subscriptButton}
                        type="button"
                        onClick={() => handleButtonClick("_{}")}
                        data-testid="sub-button"
                    ></button>
                    <button
                        className="mathquill-button screen-button"
                        id="e-button"
                        ref={eButton}
                        type="button"
                        onClick={() => handleButtonClick("e^{}")}
                        data-testid="e-button"
                    ></button>
                    <button
                        className="mathquill-button screen-button"
                        id="neq-button"
                        ref={neqButton}
                        type="button"
                        onClick={() => handleButtonClick("\\neq")}
                        data-testid="neq-button"
                    ></button>
                    <button
                        className="mathquill-button screen-button"
                        id="lambda-button"
                        ref={lambdaButton}
                        type="button"
                        onClick={() => handleButtonClick("\\lambda")}
                        data-testid="lambda-button"
                    ></button>
                    <div className="matrix-container">
                        <button
                            className="mathquill-button screen-button"
                            id="matrix-button"
                            ref={matrixButton}
                            type="button"
                            onClick={() => {
                                setShowMatrixModal(!showMatrixModal)
                            }}
                        ></button>
                        {
                            // Matrix modal
                            showMatrixModal && (
                                <div className="matrix-modal">
                                    <div className="matrix-default-buttons-grid">
                                        <button
                                            className="mathquill-button modal-button"
                                            id="vector2by1-button"
                                            ref={vector2by1}
                                            type="button"
                                            onClick={() =>
                                                matrixSubmitParams(2, 1)
                                            }
                                            data-testid="vector2by1-button"
                                        ></button>
                                        <button
                                            className="mathquill-button modal-button"
                                            id="vector3by1-button"
                                            ref={vector3by1}
                                            type="button"
                                            onClick={() =>
                                                matrixSubmitParams(3, 1)
                                            }
                                            data-testid="vector3by1-button"
                                        ></button>
                                        <button
                                            className="mathquill-button modal-button"
                                            id="matrix2by2-button"
                                            ref={matrix2by2}
                                            type="button"
                                            onClick={() =>
                                                matrixSubmitParams(2, 2)
                                            }
                                            data-testid="matrix2by2-button"
                                        ></button>
                                        <button
                                            className="mathquill-button modal-button"
                                            id="matrix3by3-button"
                                            ref={matrix3by3}
                                            type="button"
                                            onClick={() =>
                                                matrixSubmitParams(3, 3)
                                            }
                                            data-testid="matrix3by3-button"
                                        ></button>
                                    </div>
                                    <div className="matrix-modal-input-container">
                                        <form className="modal-form">
                                            <input
                                                type="number"
                                                className="modal-input"
                                                value={matrixRows}
                                                onChange={(e) => {
                                                    setMatrixRows(
                                                        parseInt(e.target.value)
                                                    )
                                                }}
                                                min={1}
                                                max={9}
                                            />
                                        </form>
                                        <span className="modal-X">x</span>
                                        <form className="modal-form">
                                            <input
                                                type="number"
                                                className="modal-input"
                                                value={matrixColumns}
                                                onChange={(e) => {
                                                    setMatrixColumns(
                                                        parseInt(e.target.value)
                                                    )
                                                }}
                                                min={1}
                                                max={9}
                                            />
                                        </form>
                                        <button
                                            type="button"
                                            className="modal-confirm-button"
                                            onClick={matrixSubmit}
                                        >
                                            {"\u2713"}
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </form>
        </>
    )
}

export default QuestionForm
