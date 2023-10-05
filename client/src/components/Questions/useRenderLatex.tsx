import { useEffect, useRef } from "react"
import katex from "katex"

// Function to render the latex, the only things that katex renders are between $$..$$ tags
// the rest will remain as normal text.
export function renderLatex(latex: string): string {
    const regex = /\$\$(.*?)\$\$/g
    return latex.replace(regex, (_, equation) => {
        try {
            return katex.renderToString(equation, {
                throwOnError: false,
                output: "mathml",
            })
        } catch (error) {
            console.error("Error rendering equation:", equation)
            return ""
        }
    })
}

// Custom hook to render the latex for both the question and the answers
export function useRenderLatex(latex: string) {
    const question = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (question.current) {
            question.current.innerHTML = renderLatex(latex)
        }
    }, [latex])

    return question
}
