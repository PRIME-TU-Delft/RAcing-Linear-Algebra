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
            boxShadow: "0px 0px 5px #000000",
            backgroundColor: "#ffffff"
        }
    } else {
        return {
            height: "30px",
            width: "30px",
            borderColor: raceLapColor,
            borderWidth: "4px",
            boxShadow: "0px 0px 5px #000000",
            backgroundColor: ghostColor
        }
    }
}

function getGhostTeamFacultyColors() {
    const colorsMAR: string[] = [
        "#ca2128",
        "#f186b6",
        "#d34797",
        "#803292",
        "#a6b3ff",
        "#64c4c0",
        "#87ce59",
        "#3eb55f",
        "#8b4513",
        "#8b0000",
        "#e0db2b",
        "#d39700",
        "#898989",
        "#2c2c99",
        "#004c60",
        "#c6aef4",
        "#39ffd9",
        "#ff7300"
    ]

    const colorsCSE: string[] = [
        "#3ebfff",
        "#f186b6",
        "#7c00ff",
        "#803292",
        "#7683ff",
        "#64c4c0",
        "#87ce59",
        "#3eb55f",
        "#015623",
        "#8b0000",
        "#e0db2b",
        "#00f3ff",
        "#898989",
        "#2c2c99",
        "#0084b2",
        "#c6aef4",
        "#39ffd9",
        "#ff7300"
    ]

    const colorsAE: string[] = [
        "#ca2128",
        "#f186b6",
        "#d34797",
        "#803292",
        "#7683ff",
        "#039fff",
        "#87ce59",
        "#43e86a",
        "#8b4513",
        "#8b0000",
        "#e0db2b",
        "#e09824",
        "#898989",
        "#2c2c99",
        "#80d5ff",
        "#c6aef4",
        "#39ffd9",
        "#0623F9"
    ]

    const colorsMCH: string[] = [
        "#ca2128",
        "#ff00e1",
        "#d34797",
        "#803292",
        "#7683ff",
        "#64c4c0",
        "#87ce59",
        "#3eb55f",
        "#39bdff",
        "#8b0000",
        "#e0db2b",
        "#0c6852",
        "#898989",
        "#2c2c99",
        "#0084b2",
        "#c6aef4",
        "#39ffd9",
        "#0623f9"
    ]

    return {
        mch: colorsMCH,
        ae: colorsAE,
        mar: colorsMAR,
        cse: colorsCSE
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

function getShuffledIndexArray(length: number) {
    const resultArray: number[] = [];

    for (let i = 0; i < length; i++) {
        resultArray.push(i);
    }

    // Using the standard implementation of the Fisher-Yates (aka Knuth) Shuffle algorithm
    let currentIndex = resultArray.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [resultArray[currentIndex], resultArray[randomIndex]] = [resultArray[randomIndex], resultArray[currentIndex]];
    }

    return resultArray
}

export function getColorForStudy(study: string) {
    switch(study.toLowerCase()) {
        case "cse":
            return { mainColor: "#003B91", highlightColor: "#EC40FF" }
        case "ae":
            return { mainColor: "#2BB7E2", highlightColor: "#DB274B" }
        case "mch":
            return { mainColor: "#F98F46", highlightColor: "#274BFF" }
        case "mar":
            return { mainColor: "#9E1976", highlightColor: "#2AD8D3" }
        case "as":
            return { mainColor: "#4ABF32", highlightColor: "#C652E2" }
        case "ce":
            return { mainColor: "#FFFF5A", highlightColor: "#539AE0" }
        case "am":
            return { mainColor: "#556B2F", highlightColor: "#FFD700" }
        case "ap":
            return { mainColor: "#1E90FF", highlightColor: "#FF6F61" }
        case "aubs":
            return { mainColor: "#DAA520", highlightColor: "#6A5ACD" }
        case "ct":
            return { mainColor: "#8A2BE2", highlightColor: "#FFB347" }
        case "ect":
            return { mainColor: "#20B2AA", highlightColor: "#F08080" }
        case "ee":
            return { mainColor: "#4169E1", highlightColor: "#FF69B4" }
        case "ide":
            return { mainColor: "#FF4500", highlightColor: "#7FFFD4" }
        case "lst":
            return { mainColor: "#00CED1", highlightColor: "#FF8C00" }
        case "mst":
            return { mainColor: "#DC143C", highlightColor: "#20B2AA" }
        case "nb":
            return { mainColor: "#8B008B", highlightColor: "#FFDE59" }
        case "sepam":
            return { mainColor: "#228B22", highlightColor: "#FF69B4" }
        default:
            return { mainColor: "#003B91", highlightColor: "#D585FF" }
    }
}

function getHiglightColor(study: string, index: number) {
    const colors = getGhostTeamFacultyColors()

    switch(study) {
        case "cse":
            return colors.cse[index]
        case "ae":
            return colors.ae[index]
        case "mch":
            return colors.mch[index]
        case "mar":
            return colors.mar[index]
        default:
            return colors.cse[index]
    }
}

export function initializeFrontendGhostObjects(ghosts: ServerGhost[]) {
    // const highlightColors: string[] = getShuffledGhotsColors()

    const higlightColorsIndexArray: number[] = getShuffledIndexArray(18)

    // // Safety check to make sure number of ghosts matches the preset number of colors (18)
    // if (highlightColors.length < ghosts.length) {
    //     const numOfMissingColors = ghosts.length - highlightColors.length
    //     for (let i = 0; i < numOfMissingColors; i++) {
    //         highlightColors.push("#" + Math.random().toString(16).substring(2, 8))
    //     }
    // }

    // const initializedGhosts: Ghost[] = ghosts.map((x, i) => ({
    //     ...x,
    //     key: i,
    //     colors: { mainColor: getColorForStudy(x.study), highlightColor: highlightColors[i]},
    //     lapsCompleted: 0,
    //     animationStatus: {
    //         pathProgress: 0,    // initialize all ghost to progress of 0%
    //         transitionDuration: 1,  // transition duration initalized at 1, changes when updating
    //         timeScoreIndex: 0   // intialize index to 0, so the ghost first aims to reach its first time score
    //     }
    // }))

    const initializedGhosts: Ghost[] = ghosts.map((x, i) => ({
        ...x,
        key: i,
        colors: { mainColor: getColorForStudy(x.study).mainColor, highlightColor: getColorForStudy(x.study).highlightColor },
        lapsCompleted: 0,
        racePosition: -1,
        isOpen: false,
        animationStatus: {
            pathProgress: 0,    // initialize all ghost to progress of 0%
            updateAnimation: false,  // transition duration initalized at 1, changes when updating
            timeScoreIndex: 0   // intialize index to 0, so the ghost first aims to reach its first time score
        }
    }))
    
    return initializedGhosts
}

