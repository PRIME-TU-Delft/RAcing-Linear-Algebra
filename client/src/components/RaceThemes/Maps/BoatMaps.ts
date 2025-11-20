import Sprites from "../Sprites/BoatThemeSprites"
import { PercentCoordinate, RaceMap } from "../SharedUtils"
import zIndex from "@mui/material/styles/zIndex"
import Seagull from "./SpecialDecorationComponents/Seagull/Seagull"
import Schiphol from "./SpecialDecorationComponents/Schiphol/Schiphol"
import DolphinPod from "./SpecialDecorationComponents/DolphinPod/DolphinPod"
import Seals from "./SpecialDecorationComponents/Seals/Seals"
import Lighthouse from "./SpecialDecorationComponents/Lighthouse/Lighthouse"
import Deer from "./SpecialDecorationComponents/Deer/Deer"
import AmsterdamSail from "./SpecialDecorationComponents/AmsterdamSail/AmsterdamSail"
import DuckSwim from "./SpecialDecorationComponents/DuckSwim/DuckSwim"
import WindmillPark from "./SpecialDecorationComponents/WindmillPark/WindmillPark"

const mapOne = {
            backgroundColor: "#00ccff",
            decorations: [
                {
                    points: [{ xPercent: 0.4, yPercent: 0.1 }],
                    class: "utrecthDom",
                    sprite: Sprites.utrecthDom,
                },

                {
                    points: [{ xPercent: 0.08, yPercent: 0.22  }],
                    class: "nieuweKerkBoat",
                    sprite: Sprites.nieuweKerk,
                },

                {
                    points: [{ xPercent: 0.105, yPercent: 0.27  }],
                    class: "thePierBoat",
                    sprite: Sprites.thePier,
                },

                {
                    points: [{ xPercent: 0.04, yPercent: 0.09  }],
                    class: "rotterdamBridgeBoat",
                    sprite: Sprites.rotterdamBridge,
                },

                {
                    points: [{ xPercent: 0.21, yPercent: 0.2  }],
                    class: "skyscraperBoat",
                    sprite: Sprites.skyScraper1,
                },

                {
                    points: [{ xPercent: 0.23, yPercent: 0.17  }],
                    class: "skyscraperBoat",
                    sprite: Sprites.skyScraper2,
                    zIndex: -1
                },

                {
                    points: [{ xPercent: 0.01, yPercent: 0.85  }],
                    class: "cruiseBoat",
                    sprite: Sprites.cruise,
                },

                {
                    points: [{ xPercent: 0.43, yPercent: 0.37  }],
                    class: "amsterdam",
                    sprite: Sprites.amsterdam,
                },

                {
                    points: [{ xPercent: 0.55, yPercent: 0.53  }],
                    class: "cheeseBoat",
                    sprite: Sprites.cheese,
                },

                {
                    points: [{ xPercent: 0.155, yPercent: 0.375  }, { xPercent: 0.75, yPercent: 0.34  }],
                    class: "seagullBoat",
                    sprite: Sprites.seagullFly,
                    zIndex: 1000
                },

                {
                    points: [{ xPercent: 0.04, yPercent: 0.19  }],
                    class: "duckBoat",
                    sprite: Sprites.duck,
                    zIndex: 1000
                },

            ],
            path: [
            ],

            components: [
                { component: Seagull, props: {theme: 'boat'} },
                { component: Schiphol, props: {} },
                { component: DolphinPod, props: { points: [ {top: 0.4, left: 0.15, flipped: false}, {top: 0.1, left: -0.04, flipped: true}, {top: 0.35, left: 0.35, flipped: false} ] } },
                { component: DolphinPod, props: { points: [ {top: 0.24, left: 0.82, flipped: false}, {top: 0.05, left: 0.55, flipped: true}] } },
                { component: Seals, props: { points: [ {top: 0.32, left: 0.178, flipped: false} ] } },
                { component: Lighthouse, props: {} },
                { component: Deer, props: { startLeft: 50, startTop: 90, flipped: true } },
                { component: Deer, props: { startLeft: 70, startTop: 83, flipped: false } },
                { component: Deer, props: { startLeft: 90, startTop: 80, flipped: true } },
                { component: AmsterdamSail, props: {} },
                { component: DuckSwim, props: { startLeft: 50, startTop: 72.5, flipped: true, scale: 0.4 } },
                { component: DuckSwim, props: { startLeft: 36, startTop: 90, flipped: false, scale: 0.5 } },
                { component: WindmillPark, props: {} },
            ],
            widthToHeightRatio: 1920 / 1080,
            rawPath: "M441.9,937.18c-6.99-3.1-14.51-4.81-22.15-5.05-12.15-.37-32.6-.52-57.08,1.2-38,2.67-72.67-4-108.67-33.33-5.61-4.57-20.66-.65-26-6s5.17-11,3.67-14.67c-2.92-7.13-39.65,3.19-44-3.67-12.17-19.17-74.1-10.71-78.83-25.67-3.34-10.57,3.77-19.58,1.5-30.83-3.47-17.21-15.95-31.16-17.33-49.33-8.76-115.09-13-211.83,101.67-271.17,182.96-94.67,197.33-222.67,197.33-222.67,0,0-50.67-178.67,502.67-60,0,0,114.65,34.96,204,114.67,45.23,40.35,54.01,54.97,55.47,59.91.53,1.79,1.83,3.26,3.5,4.1,6.15,3.09,27.03.78,45.92,6.67,28.7,8.94,61.71,25.14,101.78,16,76-17.33,180-13.33,172,56s65.33,74.67,65.33,74.67c0,0,101.33,20-152,68,0,0-37.33-1.33-60,52s4,72-264,68c0,0-116,0-138.67,18.67s-60-20-60-20c0,0-41.33-18.67-14.67,29.33,0,0,32-2.67-134.67,73.33,0,0-24.72,6.74,3.28,40.07,0,0,23.39,6.6-19.28,43.93,0,0-21.33,24-9.33,42.67s-22.67,12-22.67,12c0,0-29.33-22.67-54.67-13.33,0,0-137.33-8-146.67-13.33l-27.43-12.15Z"
}
const boatMaps: RaceMap[] = [mapOne]

export { boatMaps }
