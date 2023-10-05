import Sprites from "../TrainTheme/TrainThemeSprites"
import { PercentCoordinate } from "../SharedUtils"

interface DecorationElement {
    points: PercentCoordinate[]
    class: string
    sprite: string
}

interface MapSection {
    backgroundColor: string // the color of the background for the given theme
    decorations: DecorationElement[] // list of decorations for the map
    tracks: PercentCoordinate[] // list of corner points for the tracks of the train theme
}

interface Map {
    sections: MapSection[]
}

const mapOne = {
    sections: [
        {
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
        },
        {
            backgroundColor: "#fff6e4",
            decorations: [
                {
                    points: [
                        { xPercent: 0.400390625, yPercent: 0.6166253101736973 },
                        {
                            xPercent: 0.16666666666666666,
                            yPercent: 0.5918114143920595,
                        },
                        {
                            xPercent: 0.10481770833333331,
                            yPercent: 0.6749379652605458,
                        },
                        { xPercent: 0.13671875, yPercent: 0.7878411910669975 },
                        {
                            xPercent: 0.20052083333333331,
                            yPercent: 0.7270471464019851,
                        },
                        {
                            xPercent: 0.31184895833333337,
                            yPercent: 0.8870967741935484,
                        },
                        { xPercent: 0.01953125, yPercent: 0.7369727047146402 },
                        {
                            xPercent: 0.10286458333333331,
                            yPercent: 0.8945409429280397,
                        },
                        {
                            xPercent: 0.008463541666666664,
                            yPercent: 0.6116625310173698,
                        },
                        { xPercent: 0.37109375, yPercent: 0.8995037220843672 },
                        {
                            xPercent: 0.22786458333333334,
                            yPercent: 0.9602977667493797,
                        },
                        {
                            xPercent: 0.14908854166666666,
                            yPercent: 0.9528535980148882,
                        },
                        {
                            xPercent: -0.027343750000000003,
                            yPercent: 0.8275434243176178,
                        },
                        {
                            xPercent: 0.42513020833333337,
                            yPercent: 0.7965260545905707,
                        },
                    ],
                    class: "tree",
                    sprite: Sprites.treeOne,
                },
                {
                    points: [
                        {
                            xPercent: 0.2623697916666667,
                            yPercent: 0.6339950372208436,
                        },
                        {
                            xPercent: 0.3600260416666667,
                            yPercent: 0.7667493796526055,
                        },
                        {
                            xPercent: 0.25520833333333337,
                            yPercent: 0.8486352357320099,
                        },
                        {
                            xPercent: 0.28450520833333337,
                            yPercent: 0.7580645161290323,
                        },
                        {
                            xPercent: 0.3248697916666667,
                            yPercent: 0.6563275434243176,
                        },
                        {
                            xPercent: 0.18619791666666666,
                            yPercent: 0.8647642679900744,
                        },
                        { xPercent: 0.06640625, yPercent: 0.8200992555831266 },
                        { xPercent: 0.01171875, yPercent: 0.8895781637717122 },
                        {
                            xPercent: 0.07161458333333334,
                            yPercent: 0.5930521091811414,
                        },
                        {
                            xPercent: 0.4264322916666667,
                            yPercent: 0.93424317617866,
                        },
                        {
                            xPercent: 0.04296874999999999,
                            yPercent: 0.9466501240694789,
                        },
                    ],
                    class: "tree",
                    sprite: Sprites.treeTwo,
                },
                {
                    points: [
                        {
                            xPercent: 0.9205729166666666,
                            yPercent: 0.2518610421836228,
                        },
                        { xPercent: 0.83203125, yPercent: 0.0955334987593052 },
                        { xPercent: 0.77734375, yPercent: 0.02977667493796523 },
                        {
                            xPercent: 0.7669270833333333,
                            yPercent: 0.16004962779156331,
                        },
                        { xPercent: 0.69921875, yPercent: 0.09677419354838715 },
                        {
                            xPercent: 0.6725260416666666,
                            yPercent: 0.26923076923076916,
                        },
                        {
                            xPercent: 0.6998697916666666,
                            yPercent: 0.38337468982630274,
                        },
                        {
                            xPercent: 0.767578125,
                            yPercent: 0.37593052109181135,
                        },
                        { xPercent: 0.826171875, yPercent: 0.3957816377171216 },
                        { xPercent: 0.83203125, yPercent: 0.24441687344913157 },
                        {
                            xPercent: 0.8736979166666666,
                            yPercent: 0.33250620347394544,
                        },
                        {
                            xPercent: 0.9134114583333333,
                            yPercent: 0.3982630272952853,
                        },
                    ],
                    class: "tree",
                    sprite: Sprites.treeThree,
                },
                {
                    points: [
                        {
                            xPercent: 0.7493489583333333,
                            yPercent: 0.23821339950372203,
                        },
                    ],
                    class: "lake",
                    sprite: Sprites.lakeOne,
                },
                {
                    points: [
                        {
                            xPercent: 0.8974609375,
                            yPercent: 0.07320099255583126,
                        },
                    ],
                    class: "lake",
                    sprite: Sprites.lakeTwo,
                },
                {
                    points: [
                        {
                            xPercent: 0.5071614583333333,
                            yPercent: -0.029776674937965236,
                        },
                        {
                            xPercent: 0.16276041666666669,
                            yPercent: -0.0421836228287841,
                        },
                        { xPercent: 0.630859375, yPercent: 0.5918114143920596 },
                    ],
                    class: "windmill",
                    sprite: Sprites.windmill,
                },
            ],
            tracks: [
                { xPercent: 0.4, yPercent: 0 },
                { xPercent: 0.4, yPercent: 0.3 },
                { xPercent: 0.1, yPercent: 0.3 },
                { xPercent: 0.1, yPercent: 0.5 },
                { xPercent: 0.9, yPercent: 0.5 },
                { xPercent: 0.9, yPercent: 0.9 },
                { xPercent: 0.5, yPercent: 0.9 },
                { xPercent: 0.5, yPercent: 1 },
            ],
        },
    ],
}
const maps: Map[] = [mapOne]

export { maps }
