import Sprites from "../BoatTheme/BoatThemeSprites"
import { PercentCoordinate } from "../SharedUtils"

interface DecorationElement {
    points: PercentCoordinate[]
    class: string
    sprite: string
}

interface MapSection {
    backgroundColor: string
    decorations: DecorationElement[]
    path: PercentCoordinate[]
}

interface Map {
    sections: MapSection[]
}

const mapOne = {
    sections: [
        {
            backgroundColor: "#19CDFF",
            decorations: [
                {
                    points: [{ xPercent: 0.45, yPercent: 0.2 }],
                    class: "shark",
                    sprite: Sprites.shark,
                },

                {
                    points: [{ xPercent: 0.45, yPercent: 0.5 }],
                    class: "shark",
                    sprite: Sprites.sharkReverse,
                },

                {
                    points: [{ xPercent: -0.07, yPercent: 0.78 }],
                    class: "sun",
                    sprite: Sprites.sun,
                },

                {
                    points: [{ xPercent: 0.85, yPercent: 0.45 }],
                    class: "iceberg-one",
                    sprite: Sprites.icebergOne,
                },

                {
                    points: [{ xPercent: -0.01, yPercent: 0.3 }],
                    class: "lighthouse",
                    sprite: Sprites.lighthouse,
                },
            ],
            path: [
                { xPercent: 0, yPercent: 0.15 },
                { xPercent: 0.65, yPercent: 0.15 },
                { xPercent: 0.65, yPercent: 0.45 },
                { xPercent: 0.2, yPercent: 0.45 },
                { xPercent: 0.2, yPercent: 0.75 },
                { xPercent: 1, yPercent: 0.75 },
            ],
        },
        {
            backgroundColor: "#19CDFF",
            decorations: [
                {
                    points: [{ xPercent: 0.85, yPercent: 0.8 }],
                    class: "sun",
                    sprite: Sprites.sun,
                },
                {
                    points: [{ xPercent: 0.2, yPercent: 0.45 }],
                    class: "shark",
                    sprite: Sprites.shark,
                },
                {
                    points: [{ xPercent: 0.75, yPercent: 0.05 }],
                    class: "shark",
                    sprite: Sprites.sharkReverse,
                },
                {
                    points: [
                        { xPercent: 0.1, yPercent: 0.2 },
                        { xPercent: 0.5, yPercent: 0.4 },
                    ],
                    class: "iceberg-one",
                    sprite: Sprites.icebergOne,
                },
                {
                    points: [{ xPercent: 0.65, yPercent: 0.1 }],
                    class: "iceberg-two",
                    sprite: Sprites.icebergTwo,
                },
                {
                    points: [{ xPercent: 0.25, yPercent: 0.85 }],
                    class: "iceberg-three",
                    sprite: Sprites.icebergThree,
                },
            ],
            path: [
                { xPercent: 0, yPercent: 0.75 },
                { xPercent: 0.4, yPercent: 0.75 },
                { xPercent: 0.4, yPercent: 0.3 },
                { xPercent: 1, yPercent: 0.3 },
            ],
        },
    ],
}

const maps: Map[] = [mapOne]

export { maps }
