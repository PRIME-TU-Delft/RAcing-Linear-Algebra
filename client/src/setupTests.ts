// Extends Vitest's `expect` with DOM matchers such as toBeInTheDocument().
// See https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/vitest"
import { resetMockSocket } from "./test/mockSocket"

// No test talks to a real backend: the socket is replaced by an in-memory mock
// (see src/test/mockSocket.ts), and fetch fails loudly unless a test mocks it
// with vi.mocked(fetch).mockResolvedValueOnce(...).
vi.mock("./socket", async () => ({
    default: (await import("./test/mockSocket")).mockSocket,
}))

beforeEach(() => {
    resetMockSocket()
    vi.stubGlobal(
        "fetch",
        vi.fn((url: string) =>
            Promise.reject(
                new Error(`fetch(${url}) was not mocked in this test`)
            )
        )
    )
})

afterEach(() => {
    vi.unstubAllGlobals()
})
