import Sprites from "../Sprites/BoatThemeSprites"
import { PercentCoordinate, RaceMap } from "../SharedUtils"

const mapOne = {
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
}
const boatMaps: RaceMap[] = [mapOne]

export { boatMaps }
