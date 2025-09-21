import Sprites from "../Sprites/TrainThemeSprites"
import { PercentCoordinate, RaceMap } from "../SharedUtils"
import BeachSea from "./SpecialDecorationComponents/BeachSea/BeachSea"
import Seagull from "./SpecialDecorationComponents/Seagull/Seagull"
import BridgeRiver from "./SpecialDecorationComponents/RiverBridge/BridgeRiver"

const mapOne: RaceMap = {
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
            path: [
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
    path: [
        { xPercent: 0.5, yPercent: 0.1 },
        { xPercent: 0.9, yPercent: 0.1 },
        { xPercent: 0.9, yPercent: 0.9 },
        { xPercent: 0.1, yPercent: 0.9 },
        { xPercent: 0.1, yPercent: 0.1 },
        { xPercent: 0.5, yPercent: 0.1 },
    ],
}

const netherlandsMap1 = {
    backgroundColor: "#fff6e4",
    decorations: [
        {
            points: [
                {xPercent: 0.285, yPercent: 0.19},
                {xPercent: 0.325, yPercent: 0.19},
                {xPercent: 0.365, yPercent: 0.19},
                {xPercent: 0.405, yPercent: 0.19},
                {xPercent: 0.445, yPercent: 0.19},
                {xPercent: 0.485, yPercent: 0.19},
                {xPercent: 0.525, yPercent: 0.19},
                {xPercent: 0.565, yPercent: 0.19},
                {xPercent: 0.605, yPercent: 0.19},
                {xPercent: 0.645, yPercent: 0.19},
                {xPercent: 0.285, yPercent: 0.255},
                {xPercent: 0.325, yPercent: 0.255},
                {xPercent: 0.365, yPercent: 0.255},
                {xPercent: 0.405, yPercent: 0.255},
                {xPercent: 0.445, yPercent: 0.255},
                {xPercent: 0.485, yPercent: 0.255},
                {xPercent: 0.525, yPercent: 0.255},
                {xPercent: 0.565, yPercent: 0.255},
                {xPercent: 0.605, yPercent: 0.255},
                {xPercent: 0.645, yPercent: 0.255},
                {xPercent: 0.285, yPercent: 0.32},
                {xPercent: 0.325, yPercent: 0.32},
                {xPercent: 0.365, yPercent: 0.32},
                {xPercent: 0.405, yPercent: 0.32},
                {xPercent: 0.445, yPercent: 0.32},
                {xPercent: 0.485, yPercent: 0.32},
                {xPercent: 0.525, yPercent: 0.32},
                {xPercent: 0.565, yPercent: 0.32},
                {xPercent: 0.605, yPercent: 0.32},
                {xPercent: 0.645, yPercent: 0.32},

            ],
            class: "tree",
            sprite: Sprites.treeOne,
        },
        {
            points: [
                {xPercent: 0.72, yPercent: 0.44},
                {xPercent: 0.72, yPercent: 0.61}
            ],
            class: "windmill",
            sprite: Sprites.windmill
        },
        {
            points: [
                {xPercent: 0.11, yPercent: 0.68},
            
            ],
            class: "lake-one",
            sprite: Sprites.lakeOne
        },
        {
            points: [
                {xPercent: 0.20, yPercent: 0.74},
            
            ],
            class: "lake-two",
            sprite: Sprites.lakeTwo
        },
        {
            points: [
                { xPercent: 0.72, yPercent: 0.8 },
                { xPercent: 0.69, yPercent: 0.75 },
                { xPercent: 0.66, yPercent: 0.8 },
                { xPercent: 0.63, yPercent: 0.75 },
                { xPercent: 0.6, yPercent: 0.8 },
                { xPercent: 0.57, yPercent: 0.75 },
                { xPercent: 0.54, yPercent: 0.8 },
                { xPercent: 0.51, yPercent: 0.75 },
                { xPercent: 0.48, yPercent: 0.8 },
                { xPercent: 0.45, yPercent: 0.75 },
                { xPercent: 0.42, yPercent: 0.8 },
                { xPercent: 0.39, yPercent: 0.75 }
            
            ],
            class: "tree",
            sprite: Sprites.treeThree
        },
        {
            points: [
                { xPercent: 0.06, yPercent: 0.40 },
                { xPercent: 0.18, yPercent: 0.46 },
                { xPercent: 0.1, yPercent: 0.2 },
                { xPercent: 0.17, yPercent: 0.08 },
            ],
            class: "tree",
            sprite: Sprites.treeTwo
        },
        {
            points: [
                { xPercent: 0.15, yPercent: 0.35 },
            
            ],
            class: "swamp-rock",
            sprite: Sprites.swampRock
        },
        {
            points: [
                { xPercent: 0.2, yPercent: 0.35 },
                { xPercent: 0.15, yPercent: 0.31 },
                { xPercent: 0.12, yPercent: 0.38 },
                { xPercent: 0.07, yPercent: 0.19 },
                { xPercent: 0.15, yPercent: 0.15 },
            ],
            class: "swamp-plant",
            sprite: Sprites.swampPlant
        },
    ],    path: [
        {xPercent: 0.5, yPercent: 0.1},
        {xPercent: 0.7, yPercent: 0.1},
        {xPercent: 0.7, yPercent: 0.4},
        {xPercent: 0.9, yPercent: 0.4},
        {xPercent: 0.9, yPercent: 0.9},
        {xPercent: 0.05, yPercent: 0.9},
        {xPercent: 0.05, yPercent: 0.6},
        {xPercent: 0.25, yPercent: 0.6},
        {xPercent: 0.25, yPercent: 0.1},
        {xPercent: 0.5, yPercent: 0.1},
    ]
}

const netherlandsMap2: RaceMap = {
    backgroundColor: "#ffeecbff",
    decorations: [
        {
            points: [
            {xPercent: 0.18629173989455186, yPercent: 0.4329411764705883},
            ],
            class: "nieuweKerk",
            sprite: Sprites.nieuweKerk,
            zIndex: 9999
        },
        {
            points: [
            {xPercent: 0.24253075571177501, yPercent: 0.5658823529411765},
            ],
            class: "oudeKerk",
            sprite: Sprites.oudeKerk,
        },
        {
            points: [
            {xPercent: 0.274862331575864, yPercent: 0.045882352941178},
            ],
            class: "cruiseShip",
            sprite: Sprites.cruiseShip,
            zIndex: 9999
        },
        {
            points: [
            {xPercent: 0.2119449326303456, yPercent: 0.00129411764705827},
            ],
            class: "rotterdamBridge",
            sprite: Sprites.rotterdamBridge,
            zIndex: 8888
        },
        {
            points: [
            {xPercent: 0.102026947861746, yPercent: 0.8088235294117647},
            ],
            class: "thePier",
            sprite: Sprites.thePier,
        },
        {
            points: [
            {xPercent: 0.8256707674282366, yPercent: 0.5658823529411764},
            ],
            class: "goudaKerk",
            sprite: Sprites.goudaKerk,
        },
        {
            points: [
            {xPercent: 0.7805213825424721, yPercent: 0.5658823529411764},
            ],
            class: "cheese",
            sprite: Sprites.cheese,
        },
    ],
    components: [BeachSea(), Seagull(), BridgeRiver()],
    path: [
        { xPercent: 0.235, yPercent: 0.5 },
        { xPercent: 0.1, yPercent: 0.5 },
        { xPercent: 0.1, yPercent: 0.75 },
        { xPercent: 0.18, yPercent: 0.75 },
        { xPercent: 0.18, yPercent: 0.9 },
        { xPercent: 0.9, yPercent: 0.9 },
        { xPercent: 0.9, yPercent: 0.5 },
        { xPercent: 0.74, yPercent: 0.5 },   
        { xPercent: 0.74, yPercent: 0.05 },
        { xPercent: 0.57, yPercent: 0.05 },
        { xPercent: 0.57, yPercent: 0.17 },
        { xPercent: 0.33, yPercent: 0.17 },
        { xPercent: 0.33, yPercent: 0.5 },
        { xPercent: 0.235, yPercent: 0.5 },

    ]
}

const trainMaps: RaceMap[] = [netherlandsMap1, netherlandsMap2]

export { trainMaps }
