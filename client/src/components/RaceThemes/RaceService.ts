import TrainThemeSprites from "./Sprites/TrainThemeSprites"
import BoatThemeSprites from "./Sprites/BoatThemeSprites"
import { Component, PercentCoordinate, Point } from "./SharedUtils"

export function formatRacePositionText(position: number) {
    switch (position) {
        case 1:
            return "1st"
        
        case 2:
            return "2nd"
        
        case 3:
            return "3rd"

        default:
            return position.toString() + "th"
    }
}

export function getRaceVehicleSprite(theme: string) {
    switch(theme) {
        case "train":
            return TrainThemeSprites.train
        case "boat":
            return BoatThemeSprites.boat
        default:
            return TrainThemeSprites.train
    }
}

/**
 * Gets the color used for the race lap the ghost is currently in
 * @param ghost ghost team to check
 * @param totalPoints number of points required to complete a race lap
 * @param raceLapColors list of colors to be used for individual race laps
 * @returns color for the race lap the ghost team is in
 */
export function getColorForRaceLap(lapsCompleted: number) {
    const raceLapColors = ["#23D851", "#E8E807", "#D81212", "#FF15E9", "#A129FF"]    // colors used to distinguish between the different race laps
    return raceLapColors[lapsCompleted]
}

/**
 * Gets the base z-index values used for objects of the game, which represent the maximum possible z-index an object will have 
 * (might be smaller due to layering purposes)
 * @returns object of the base z-index values
 */
export function getZIndexValues() {
    const values = {
        mainVehicle: 7000,
        decoration: 2000,
        ghostVehicle: 6000
    }
    return values
}

export function getRacePathObject(trackPoints: PercentCoordinate[], containerWidth: number, containerHeight: number, offsetX = 0, offsetY = 0) {
    const points: Point[] = [] // list of points computed from track coordinates
    let svgPath = "M" // svg path that the team takes

    // Transform coordinates into points and generate the svg path from said points
    for (let i = 0; i < trackPoints.length; i++) {
        points.push(
            new Point(
                trackPoints[i].xPercent * containerWidth + offsetX,
                trackPoints[i].yPercent * containerHeight + offsetY
            )
        )

        if (i != 0) svgPath += "L" // L means move to coordinates x y, e.g. L 1 2
        svgPath +=
            (points[i].x + 20).toString() +
            " " +
            (containerHeight - points[i].y - 20).toString() +
            " "
    }

    const components: Component[] = []
    let tracksLength = 0

    for (let i = 0; i < points.length - 1; i++) {
        let direction = "vertical"
        if (points[i].x != points[i + 1].x) direction = "horizontal"

        components.push(new Component(points[i], points[i + 1], direction))
        tracksLength += components[i].length
    }

    return {
        svgPath: svgPath,
        pathLength: tracksLength,
        components: components
    }
}