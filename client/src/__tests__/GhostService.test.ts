/**
 * Characterisation tests for GhostService (see REFACTORING_PLAN.md step 0.4).
 */
import {
    currentGhostIsOpen,
    getColorForStudy,
    getGhostStyle,
    getRacePositionText,
    initializeFrontendGhostObjects,
} from "../components/RaceThemes/Ghosts/GhostService"
import { ServerGhost } from "../components/RaceThemes/SharedUtils"

describe("currentGhostIsOpen", () => {
    test.each([
        // [ghostPositionIndex, mainVehiclePositionIndex, isOpen]
        [0, 10, true], // top 3 are always open
        [1, 10, true],
        [2, 10, true],
        [3, 10, false],
        [6, 5, true], // just behind the main team
        [4, 5, true], // just ahead of the main team
        [7, 5, false],
        [3, 5, false],
    ])("ghost at %d, main team at %d -> %s", (ghost, main, isOpen) => {
        expect(currentGhostIsOpen(ghost, main)).toBe(isOpen)
    })
})

describe("getRacePositionText", () => {
    test.each([
        [-1, ""],
        [0, "1st"],
        [1, "2nd"],
        [2, "3rd"],
        [3, "4th"],
    ])("index %d -> %j", (index, text) => {
        expect(getRacePositionText(index)).toBe(text)
    })
})

describe("getGhostStyle", () => {
    test("open ghosts are large with a white background", () => {
        expect(getGhostStyle(true, "#lap", "#ghost")).toEqual({
            height: "55px",
            width: "55px",
            borderColor: "#lap",
            borderWidth: "3px",
            boxShadow: "0px 0px 5px #000000",
            backgroundColor: "#ffffff",
        })
    })

    test("closed ghosts are small and filled with the ghost colour", () => {
        expect(getGhostStyle(false, "#lap", "#ghost")).toEqual({
            height: "30px",
            width: "30px",
            borderColor: "#lap",
            borderWidth: "4px",
            boxShadow: "0px 0px 5px #000000",
            backgroundColor: "#ghost",
        })
    })
})

describe("getColorForStudy", () => {
    test.each([
        ["cse", "#003B91", "#EC40FF"],
        ["CSE", "#003B91", "#EC40FF"],
        ["ae", "#2BB7E2", "#DB274B"],
        ["mch", "#F98F46", "#274BFF"],
        ["mar", "#9E1976", "#2AD8D3"],
        ["sepam", "#228B22", "#FF69B4"],
    ])("%s", (study, mainColor, highlightColor) => {
        expect(getColorForStudy(study)).toEqual({ mainColor, highlightColor })
    })

    test("unknown studies get the default colours", () => {
        expect(getColorForStudy("unknown")).toEqual({
            mainColor: "#003B91",
            highlightColor: "#D585FF",
        })
        expect(getColorForStudy("")).toEqual({
            mainColor: "#003B91",
            highlightColor: "#D585FF",
        })
    })
})

describe("initializeFrontendGhostObjects", () => {
    const serverGhosts: ServerGhost[] = [
        {
            teamName: "Alpha",
            timeScores: [{ timePoint: 30, score: 10 }],
            checkpoints: [1],
            study: "AE",
            accuracy: 80,
        },
        {
            teamName: "Beta",
            timeScores: [],
            checkpoints: [],
            study: "nope",
            accuracy: 0,
        },
    ]

    test("keeps the server fields and adds keys, colours and initial race state", () => {
        const ghosts = initializeFrontendGhostObjects(serverGhosts)

        expect(ghosts).toEqual([
            {
                ...serverGhosts[0],
                key: 0,
                colors: { mainColor: "#2BB7E2", highlightColor: "#DB274B" },
                lapsCompleted: 0,
                racePosition: -1,
                isOpen: false,
                animationStatus: {
                    pathProgress: 0,
                    updateAnimation: false,
                    timeScoreIndex: 0,
                },
            },
            {
                ...serverGhosts[1],
                key: 1,
                colors: { mainColor: "#003B91", highlightColor: "#D585FF" },
                lapsCompleted: 0,
                racePosition: -1,
                isOpen: false,
                animationStatus: {
                    pathProgress: 0,
                    updateAnimation: false,
                    timeScoreIndex: 0,
                },
            },
        ])
    })

    test("returns an empty list for no ghosts", () => {
        expect(initializeFrontendGhostObjects([])).toEqual([])
    })
})
