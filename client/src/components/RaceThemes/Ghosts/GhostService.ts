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
export function getGhostStyle(isOpen: boolean, raceLapColor: string) {
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
            borderColor: "black",
            borderWidth: "1px",
            backgroundColor: raceLapColor
        }
    }
}

function getGhostTeamColors() {
    const colors: GhostColor[] = [
        {
            mainColor: "#ca2128",
            highlightColor: "#e2d820"
        },
        {
            mainColor: "#f186b6",
            highlightColor: "#efe484"
        },
        {
            mainColor: "#d34797",
            highlightColor: "#a8a8a8"
        },
        {
            mainColor: "#803292",
            highlightColor: "#ffcd4a"
        },
        {
            mainColor: "#7683ff",
            highlightColor: "#ff9d75"
        },
        {
            mainColor: "#64c4c0",
            highlightColor: "#c166a6"
        },
        {
            mainColor: "#87ce59",
            highlightColor: "#5968cf"
        },
        {
            mainColor: "#3eb55f",
            highlightColor: "#ff7357"
        },
        {
            mainColor: "#8b4513",
            highlightColor: "#c98bcc"
        },
        {
            mainColor: "#8b0000",
            highlightColor: "#80ceff"
        },
        {
            mainColor: "#e0db2b",
            highlightColor: "#2ba4e0"
        },
        {
            mainColor: "#ff8389",
            highlightColor: "#ffe382"
        },
        {
            mainColor: "#4a504e",
            highlightColor: "#00a8bb"
        },
        {
            mainColor: "#008080",
            highlightColor: "#a973ff"
        },
        {
            mainColor: "#0bb4ff",
            highlightColor: "#ff4a4a"
        },
        {
            mainColor: "#c6aef4",
            highlightColor: "#f5d3ae"
        },
        {
            mainColor: "#39ffd9",
            highlightColor: "#ff9a36"
        },
        {
            mainColor: "#ff7300",
            highlightColor: "#4d4080"
        },
    ]
    return colors
}

function getShuffledGhotsColors() {
    const colors: GhostColor[] = getGhostTeamColors()

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

export function initializeFrontendGhostObjects(ghosts: ServerGhost[]) {
    const colors: GhostColor[] = getShuffledGhotsColors()

    // Safety check to make sure number of ghosts matches the preset number of colors (18)
    if (colors.length < ghosts.length) {
        const numOfMissingColors = ghosts.length - colors.length
        for (let i = 0; i < numOfMissingColors; i++) {
            colors.push({
                mainColor: "#" + Math.random().toString(16).substring(2, 8),
                highlightColor: "#" + Math.random().toString(16).substring(2, 8)
            })
        }
    }

    const initializedGhosts: Ghost[] = ghosts.map((x, i) => ({
        ...x,
        key: i,
        colors: { mainColor: colors[i].mainColor, highlightColor: colors[i].highlightColor},
        lapsCompleted: 0,
        animationStatus: {
            pathProgress: 0,    // initialize all ghost to progress of 0%
            transitionDuration: 1,  // transition duration initalized at 1, changes when updating
            timeScoreIndex: 0   // intialize index to 0, so the ghost first aims to reach its first time score
        }
    }))
    
    return initializedGhosts
}

