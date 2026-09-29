/**
 * Characterisation tests for GameService (see REFACTORING_PLAN.md step 0.4).
 * getRacePathSizeAndOffsetMargins sizes the player's minimap; each case below
 * hits a different breakpoint.
 */
import {
    getMinimapPathColorForTheme,
    getRacePathSizeAndOffsetMargins,
} from "../components/Game/GameService"

describe("getRacePathSizeAndOffsetMargins", () => {
    test.each([
        // [viewport width, height, expected { width, height, offsetX, offsetY }]
        [
            "1920x1080 (height 1050-1250)",
            1920,
            1080,
            { width: 768, height: 486, offsetX: 1056, offsetY: 432 },
        ],
        [
            "1024x768 (narrow, height 700-800)",
            1024,
            768,
            { width: 358.4, height: 307.2, offsetX: 640, offsetY: 307.2 },
        ],
        [
            "1366x650 (height <= 700)",
            1366,
            650,
            { width: 546.4, height: 227.5, offsetX: 751.3, offsetY: 325 },
        ],
        [
            "1440x850 (height 800-900)",
            1440,
            850,
            { width: 576, height: 340, offsetX: 792, offsetY: 425 },
        ],
        [
            "1600x1000 (height 900-1050)",
            1600,
            1000,
            { width: 640, height: 400, offsetX: 880, offsetY: 450 },
        ],
        [
            "2560x1440 (wide, height > 1350)",
            2560,
            1440,
            { width: 896, height: 576, offsetX: 1600, offsetY: 576 },
        ],
        [
            "2560x1300 (wide, height <= 1350)",
            2560,
            1300,
            { width: 896, height: 520, offsetX: 1600, offsetY: 650 },
        ],
        // Height exactly 800 matches no branch, but the defaults equal the 700-800 branch.
        [
            "1920x800 (height exactly 800)",
            1920,
            800,
            { width: 768, height: 320, offsetX: 1056, offsetY: 320 },
        ],
    ])("%s", (_label, width, height, expected) => {
        const result = getRacePathSizeAndOffsetMargins(width, height)

        expect(result.width).toBeCloseTo(expected.width)
        expect(result.height).toBeCloseTo(expected.height)
        expect(result.offsetX).toBeCloseTo(expected.offsetX)
        expect(result.offsetY).toBeCloseTo(expected.offsetY)
    })
})

describe("getMinimapPathColorForTheme", () => {
    test.each([
        ["Train", "#f8b600a2"],
        ["Boat", "#00131ba2"],
    ])("%s -> %s", (theme, color) => {
        expect(getMinimapPathColorForTheme(theme)).toBe(color)
    })

    test("BUG (Appendix B #22): theme names are case-sensitive and the fallback is not a valid colour", () => {
        expect(getMinimapPathColorForTheme("train")).toBe("#3d6faf8b600a2ff")
    })
})
