import { formatRacePositionText } from "../RaceService"
import { Ghost, ServerGhost } from "../SharedUtils"

interface GhostColor {
    mainColor: string,
    highlightColor: string
}

/**
     * Determines whether a ghost is classified as open based on its position.
     * Currently, ghosts are considered open if they fulfill one of the following conditions:
     *      - the ghost is in the top 3 in terms of position
     *      - the ghost is just ahead of the playing team
     *      - the ghost is just below of the playing team
     * @param ghostIndex    index of the ghost
     * @returns whether the ghost is considered open or not
     */
export function currentGhostIsOpen(positionIndex: number, mainVehiclePositionIndex: number) {
    if (positionIndex < 3) return true  // top 3 ghosts are always open
    else if (positionIndex - 1 == mainVehiclePositionIndex) return true    //  ghost behind main team open
    else if (positionIndex + 1 == mainVehiclePositionIndex) return true    // ghost ahead of main team is open
    else return false   
}

/**
 * Gets the text value that needs to be displayed to show the team's position
 * @param positionIndex position of the team in the race
 * @returns position text in proper format
 */
export function getRacePositionText(positionIndex: number) {
    if (positionIndex != -1) return formatRacePositionText(positionIndex + 1)
    else return ""
}

/**
 * Gets the css styling for a ghost team depeding on whether it is currently open or closed
 * @param isOpen boolean indicating whether the ghost is considered open, requiring changes in styling
 * @param raceLapColor color used for the race lap the ghost team is currently in
 * @returns the css styling to use for the ghost team
 */
export function getGhostStyle(isOpen: boolean, raceLapColor: string, ghostColor: string) {
    if (isOpen) {
        return {
            height: "55px",
            width: "55px",
            borderColor: raceLapColor,
            borderWidth: "3px",
            backgroundColor: "white"
        }
    } else {
        return {
            height: "30px",
            width: "30px",
            borderColor: raceLapColor,
            borderWidth: "3px",
            backgroundColor: ghostColor
        }
    }
}

function getGhostTeamColors() {
    const colors: string[] = [
        "#ca2128",
        "#f186b6",
        "#d34797",
        "#803292",
        "#7683ff",
        "#64c4c0",
        "#87ce59",
        "#3eb55f",
        "#8b4513",
        "#8b0000",
        "#e0db2b",
        "#c9959a",
        "#898989",
        "#2c2c99",
        "#0084b2",
        "#c6aef4",
        "#39ffd9",
        "#ff7300"
    ]
    
    return colors
}

function getShuffledGhotsColors() {
    const colors: string[] = getGhostTeamColors()

    // Using the standard implementation of the Fisher-Yates (aka Knuth) Shuffle algorithm
    let currentIndex = colors.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [colors[currentIndex], colors[randomIndex]] = [colors[randomIndex], colors[currentIndex]];
    }

    return colors
}

export function getColorForStudy(study: string) {
    switch(study.toLowerCase()) {
        case "cse":
            return "#9865fc"
        case "ae":
            return "#cccccc"
        case "mch":
            return "#3a3a3a"
        case "ae":
            return "#3dcdf9"
        default:
            return "#143862"
    }
}

export function initializeFrontendGhostObjects(ghosts: ServerGhost[]) {
    const highlightColors: string[] = getShuffledGhotsColors()

    // Safety check to make sure number of ghosts matches the preset number of colors (18)
    if (highlightColors.length < ghosts.length) {
        const numOfMissingColors = ghosts.length - highlightColors.length
        for (let i = 0; i < numOfMissingColors; i++) {
            highlightColors.push("#" + Math.random().toString(16).substring(2, 8))
        }
    }

    const initializedGhosts: Ghost[] = ghosts.map((x, i) => ({
        ...x,
        key: i,
        colors: { mainColor: getColorForStudy(x.study), highlightColor: highlightColors[i]},
        lapsCompleted: 0,
        animationStatus: {
            pathProgress: 0,    // initialize all ghost to progress of 0%
            transitionDuration: 1,  // transition duration initalized at 1, changes when updating
            timeScoreIndex: 0   // intialize index to 0, so the ghost first aims to reach its first time score
        }
    }))
    
    return initializedGhosts
}

