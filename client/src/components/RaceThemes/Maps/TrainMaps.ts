import Sprites from "../TrainTheme/TrainThemeSprites"
import { PercentCoordinate } from "../SharedUtils"

interface DecorationElement {
    points: PercentCoordinate[]
    class: string
    sprite: string
}

interface Map {
    backgroundColor: string // the color of the background for the given theme
    decorations: DecorationElement[] // list of decorations for the map
    tracks: PercentCoordinate[] // list of corner points for the tracks of the train theme
}

const mapOne: Map = {
            backgroundColor: "#fff6e4",
            decorations: [
                {
                    points: [
                        { xPercent: 0.16796875, yPercent: 0.06608478802992523 },
                        {
                            xPercent: 0.4993489583333333,
                            yPercent: 0.04613466334164584,
                        },
                        { xPercent: 0.18359375, yPercent: 0.5985037406483791 },
                        {
                            xPercent: 0.27669270833333337,
                            yPercent: 0.3528678304239401,
                        },
                        { xPercent: 0.5703125, yPercent: 0.6172069825436408 },
                        {
                            xPercent: 0.03320312499999999,
                            yPercent: 0.13840399002493764,
                        },
                    ],
                    class: "tree",
                    sprite: Sprites.treeOne,
                },
                {
                    points: [
                        {
                            xPercent: 0.5833333333333333,
                            yPercent: 0.26932668329177056,
                        },
                        { xPercent: 0.458984375, yPercent: 0.4688279301745636 },
                        {
                            xPercent: 0.048177083333333336,
                            yPercent: 0.5635910224438903,
                        },
                        {
                            xPercent: 0.2877604166666667,
                            yPercent: 0.5760598503740648,
                        },
                        {
                            xPercent: 0.13802083333333331,
                            yPercent: 0.43640897755610975,
                        },
                        {
                            xPercent: 0.5013020833333333,
                            yPercent: 0.773067331670823,
                        },
                        {
                            xPercent: 0.3151041666666667,
                            yPercent: 0.09725685785536164,
                        },
                    ],
                    class: "tree",
                    sprite: Sprites.treeTwo,
                },
                {
                    points: [
                        { xPercent: 0.83, yPercent: 0.05 },
                        { xPercent: 0.73, yPercent: 0.17 },
                        { xPercent: 0.73, yPercent: 0.37 },
                        { xPercent: 0.83, yPercent: 0.44389027431421446 },
                        { xPercent: 0.73, yPercent: 0.57 },
                        { xPercent: 0.83, yPercent: 0.65 },
                        { xPercent: 0.73, yPercent: 0.7693266832917706 },
                    ],
                    class: "tree",
                    sprite: Sprites.treeThree,
                },
                {
                    points: [
                        {
                            xPercent: 0.11067708333333331,
                            yPercent: 0.5685785536159601,
                        },
                    ],
                    class: "lake",
                    sprite: Sprites.lakeOne,
                },
                {
                    points: [
                        {
                            xPercent: 0.20345052083333334,
                            yPercent: 0.4663341645885286,
                        },
                    ],
                    class: "lake",
                    sprite: Sprites.lakeTwo,
                },
                {
                    points: [
                        { xPercent: 0.025390625, yPercent: 0.7 },
                        { xPercent: 0.205078125, yPercent: 0.7 },
                    ],
                    class: "windmill",
                    sprite: Sprites.windmill,
                },
            ],
            tracks: [
                { xPercent: 0.1, yPercent: 0 }, // |^
                { xPercent: 0.1, yPercent: 0.2 }, // ------>
                { xPercent: 0.4, yPercent: 0.2 }, // _|^
                { xPercent: 0.4, yPercent: 0.4 }, // --->
                { xPercent: 0.55, yPercent: 0.4 }, // |v
                { xPercent: 0.55, yPercent: 0.1 }, // |___
                { xPercent: 0.8, yPercent: 0.1 }, // _|^
                { xPercent: 0.8, yPercent: 0.7 }, // <-------
                { xPercent: 0.4, yPercent: 0.7 }, // ^|_
                { xPercent: 0.4, yPercent: 1 },
            ],
}

const templateLoopMap = {
    backgroundColor: "#fff6e4",
    decorations: [
    ],
    tracks: [
        { xPercent: 0.5, yPercent: 0.1 },
        { xPercent: 0.9, yPercent: 0.1 },
        { xPercent: 0.9, yPercent: 0.9 },
        { xPercent: 0.1, yPercent: 0.9 },
        { xPercent: 0.1, yPercent: 0.1 },
        { xPercent: 0.5, yPercent: 0.1 },
    ],
}
    
const maps: Map[] = [templateLoopMap]

export { maps }
