import TrainThemeSprites from "./Sprites/TrainThemeSprites"
import BoatThemeSprites from "./Sprites/BoatThemeSprites"

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