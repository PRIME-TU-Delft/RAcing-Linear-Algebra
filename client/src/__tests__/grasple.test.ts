import {
    extractGraspleExerciseId,
    extractIframeSrc,
    isGraspleExerciseUrl,
} from "../utils/grasple"

const EMBED_URL =
    "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896"

describe("extractIframeSrc", () => {
    test("returns the src of a pasted iframe snippet", () => {
        const snippet = `<iframe src="${EMBED_URL}" width="100%" height="600"></iframe>`

        expect(extractIframeSrc(snippet)).toBe(EMBED_URL)
    })

    test("returns plain URLs unchanged", () => {
        expect(extractIframeSrc(EMBED_URL)).toBe(EMBED_URL)
    })

    test("returns an iframe snippet without a double-quoted src unchanged", () => {
        const snippet = `<iframe src='${EMBED_URL}'></iframe>`

        expect(extractIframeSrc(snippet)).toBe(snippet)
    })
})

describe("isGraspleExerciseUrl", () => {
    test.each([
        [EMBED_URL, true],
        ["http://embed.grasple.com/exercises/x?id=1", true],
        ["https://grasple.com/exercises/x?id=1", false],
        ["https://example.com", false],
        ["", false],
    ])("%j -> %s", (url, expected) => {
        expect(isGraspleExerciseUrl(url)).toBe(expected)
    })
})

describe("extractGraspleExerciseId", () => {
    test.each([
        [EMBED_URL, "77896"],
        ["https://embed.grasple.com/exercises/x?id=007", "007"],
        ["https://embed.grasple.com/exercises/x?lang=en&id=12", "12"],
    ])("%j -> %j", (url, id) => {
        expect(extractGraspleExerciseId(url)).toBe(id)
    })

    test.each([
        ["https://embed.grasple.com/exercises/x"],
        // The id must be the last thing in the URL.
        ["https://embed.grasple.com/exercises/x?id=12&lang=en"],
        ["https://embed.grasple.com/exercises/x?id=abc"],
        [""],
    ])("%j -> null", (url) => {
        expect(extractGraspleExerciseId(url)).toBeNull()
    })
})
