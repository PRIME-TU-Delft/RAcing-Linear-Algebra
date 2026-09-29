/**
 * Characterisation tests for ExerciseURLInput, the field where lecturers paste
 * a Grasple exercise link (see REFACTORING_PLAN.md step 0.4).
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import ExerciseURLInput from "../components/LecturerPlatform/ExerciseElement/ExerciseURLInput/ExerciseURLInput"
import { ExistingExercisesContext } from "../components/LecturerPlatform/ExistingExercisesContext"

const EMBED_URL = "https://embed.grasple.com/exercises/abc?id=77896"

function renderInput(existingExerciseIds: number[] = []) {
    const onURLValueChange = vi.fn()
    const onExerciseAlreadyExists = vi.fn()
    render(
        <ExistingExercisesContext.Provider value={existingExerciseIds}>
            <ExerciseURLInput
                url=""
                onURLValueChange={onURLValueChange}
                onExerciseAlreadyExists={onExerciseAlreadyExists}
                currentTopicExerciseIds={[]}
            />
        </ExistingExercisesContext.Provider>
    )
    return { onURLValueChange, onExerciseAlreadyExists }
}

function paste(value: string) {
    fireEvent.change(screen.getByRole("textbox"), { target: { value } })
}

describe("ExerciseURLInput", () => {
    test("accepts a pasted iframe snippet and reports its URL and id", async () => {
        const { onURLValueChange } = renderInput()

        paste(`<iframe src="${EMBED_URL}" width="100%"></iframe>`)

        expect(await screen.findByText("#77896")).toBeInTheDocument()
        expect(screen.getByRole("textbox")).toHaveValue(EMBED_URL)
        expect(onURLValueChange).toHaveBeenCalledWith(EMBED_URL, 77896)
    })

    test.each([
        ["https://example.com/exercises/abc?id=1"],
        ["https://embed.grasple.com/exercises/abc"],
    ])("rejects %j", async (url) => {
        const { onURLValueChange } = renderInput()

        paste(url)

        expect(await screen.findByText("Invalid URL")).toBeInTheDocument()
        expect(onURLValueChange).not.toHaveBeenCalled()
    })

    test("reports an exercise that already exists and clears the field", async () => {
        const { onURLValueChange, onExerciseAlreadyExists } = renderInput([77896])

        paste(EMBED_URL)

        await waitFor(() => expect(onExerciseAlreadyExists).toHaveBeenCalledWith(77896))
        expect(screen.getByRole("textbox")).toHaveValue("")
        expect(onURLValueChange).not.toHaveBeenCalled()
    })

    test("BUG (Appendix B #36): after clearing an existing exercise the message says 'Invalid URL'", async () => {
        const { onExerciseAlreadyExists } = renderInput([77896])

        paste(EMBED_URL)

        // The empty field shows "Invalid URL" before the paste too, so wait for the
        // duplicate to be reported before checking what the message settles on.
        await waitFor(() => expect(onExerciseAlreadyExists).toHaveBeenCalled())
        expect(await screen.findByText("Invalid URL")).toBeInTheDocument()
        expect(screen.queryByText("Exercise already exists")).toBeNull()
    })
})
