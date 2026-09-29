/**
 * Characterisation tests: they pin the CURRENT behaviour of RaceService so that
 * later refactoring steps can move this code safely. Assertions marked
 * `BUG (Appendix B #n)` document known-wrong output; the fix step for that bug
 * flips the assertion. See REFACTORING_PLAN.md step 0.4.
 */
import {
    formatRacePositionText,
    getColorForRaceLap,
    getNewTimeScoreIndex,
    getRacePathObject,
    getRaceVehicleSprite,
    getZIndexValues,
} from "../components/RaceThemes/RaceService"
import { RaceMap } from "../components/RaceThemes/SharedUtils"
import TrainThemeSprites from "../components/RaceThemes/Sprites/TrainThemeSprites"
import BoatThemeSprites from "../components/RaceThemes/Sprites/BoatThemeSprites"

// A rectangle traced clockwise from the bottom-left corner, in percent coordinates.
const rectangleMap: RaceMap = {
    backgroundColor: "",
    decorations: [],
    path: [
        { xPercent: 0, yPercent: 0 },
        { xPercent: 1, yPercent: 0 },
        { xPercent: 1, yPercent: 1 },
        { xPercent: 0, yPercent: 1 },
        { xPercent: 0, yPercent: 0 },
    ],
}

describe("formatRacePositionText", () => {
    test.each([
        [1, "1st"],
        [2, "2nd"],
        [3, "3rd"],
        [4, "4th"],
        [11, "11th"],
        [12, "12th"],
        [13, "13th"],
    ])("%d -> %s", (position, text) => {
        expect(formatRacePositionText(position)).toBe(text)
    })

    test.each([
        [21, "21th"],
        [22, "22th"],
        [23, "23th"],
    ])("BUG (Appendix B #33): %d -> %s", (position, text) => {
        expect(formatRacePositionText(position)).toBe(text)
    })
})

describe("getColorForRaceLap", () => {
    test.each([
        [0, "#23D851"],
        [1, "#E8E807"],
        [2, "#D81212"],
        [3, "#FF15E9"],
        [4, "#A129FF"],
    ])("lap %d -> %s", (lap, color) => {
        expect(getColorForRaceLap(lap)).toBe(color)
    })

    test("BUG (Appendix B #34): no colour after 5 completed laps", () => {
        expect(getColorForRaceLap(5)).toBeUndefined()
    })
})

describe("getRaceVehicleSprite", () => {
    test.each([
        ["train", TrainThemeSprites.train],
        ["Train", TrainThemeSprites.train],
        ["boat", BoatThemeSprites.boat],
        ["BOAT", BoatThemeSprites.boat],
        ["unknown", TrainThemeSprites.train],
    ])("%s", (theme, sprite) => {
        expect(getRaceVehicleSprite(theme)).toBe(sprite)
    })
})

test("getZIndexValues", () => {
    expect(getZIndexValues()).toEqual({
        mainVehicle: 7000,
        decoration: 2000,
        ghostVehicle: 6000,
    })
})

describe("getRacePathObject", () => {
    test("builds the SVG path (y flipped, +20 offset, last point closed by z) and components", () => {
        const result = getRacePathObject(rectangleMap, 100, 50)

        expect(result.svgPath).toBe("M20 30 L120 30 L120 -20 L20 -20 z")
        expect(result.pathLength).toBe(300)
        expect(
            result.components.map((c) => ({
                start: { x: c.start.x, y: c.start.y },
                end: { x: c.end.x, y: c.end.y },
                direction: c.direction,
                length: c.length,
            }))
        ).toEqual([
            {
                start: { x: 0, y: 0 },
                end: { x: 100, y: 0 },
                direction: "horizontal",
                length: 100,
            },
            {
                start: { x: 100, y: 0 },
                end: { x: 100, y: 50 },
                direction: "vertical",
                length: 50,
            },
            {
                start: { x: 100, y: 50 },
                end: { x: 0, y: 50 },
                direction: "horizontal",
                length: 100,
            },
            {
                start: { x: 0, y: 50 },
                end: { x: 0, y: 0 },
                direction: "vertical",
                length: 50,
            },
        ])
    })

    test("offsets shift the points and the SVG path", () => {
        const result = getRacePathObject(rectangleMap, 100, 50, 10, 5)

        expect(result.svgPath).toBe("M30 25 L130 25 L130 -25 L30 -25 z")
        expect(result.components[0].start).toMatchObject({ x: 10, y: 5 })
        expect(result.pathLength).toBe(300)
    })

    test("a diagonal segment is treated as horizontal and measured by its x distance only", () => {
        const diagonalMap: RaceMap = {
            ...rectangleMap,
            path: [
                { xPercent: 0, yPercent: 0 },
                { xPercent: 1, yPercent: 1 },
            ],
        }

        const result = getRacePathObject(diagonalMap, 30, 40)

        expect(result.components).toHaveLength(1)
        expect(result.components[0].direction).toBe("horizontal")
        expect(result.pathLength).toBe(30)
    })

    test("BUG (Appendix B #24): a map with rawPath returns it with no length or components", () => {
        const rawMap: RaceMap = { ...rectangleMap, rawPath: "M0 0 L10 10" }

        expect(getRacePathObject(rawMap, 100, 50)).toEqual({
            svgPath: "M0 0 L10 10",
            pathLength: 0,
            components: [],
        })
    })

    test("rawPath is ignored when prioritizeRawPath is false", () => {
        const rawMap: RaceMap = { ...rectangleMap, rawPath: "M0 0 L10 10" }

        const result = getRacePathObject(rawMap, 100, 50, 0, 0, false)

        expect(result.svgPath).toBe("M20 30 L120 30 L120 -20 L20 -20 z")
        expect(result.pathLength).toBe(300)
    })
})

describe("getNewTimeScoreIndex", () => {
    const timeScores = [
        { timePoint: 0, score: 0 },
        { timePoint: 30, score: 10 },
        { timePoint: 60, score: 25 },
    ]

    test.each([
        // [currentIndex, usedTime, expected]
        [0, 0, 1],
        [0, 29, 1],
        [0, 30, 2],
        [0, 45, 2],
        [1, 45, 2],
        // Returns currentIndex + 1 even when the current time point has not been reached.
        [1, 10, 2],
        // Once every time point has passed, the index runs past the end of the array.
        [0, 100, 3],
    ])("from index %d at t=%d -> %d", (current, usedTime, expected) => {
        expect(getNewTimeScoreIndex(current, timeScores, usedTime)).toBe(
            expected
        )
    })

    test("returns -1 when already at the last time score", () => {
        expect(getNewTimeScoreIndex(2, timeScores, 100)).toBe(-1)
        expect(getNewTimeScoreIndex(5, timeScores, 100)).toBe(-1)
    })

    test("returns -1 for an empty list", () => {
        expect(getNewTimeScoreIndex(0, [], 0)).toBe(-1)
    })
})
