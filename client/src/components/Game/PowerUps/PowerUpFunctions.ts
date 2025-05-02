type BoostPowerUpFunction = (score: number, streak: number) => number

const defaultBoostFunction: BoostPowerUpFunction = (score: number, streak: number) => {
    return score
}

const steadyBoostFunction: BoostPowerUpFunction = (score: number, streak: number) => {
    return score * 1.1;
}

const daringBoostFunction: BoostPowerUpFunction = (score: number, streak: number) => {
    if (streak >= 3) return score * 1.3
    return score
}

const recklessBoostFunction: BoostPowerUpFunction = (score: number, streak: number) => {
    if (streak >= 5) return score * 1.8
    return score
}

const getBoostValue: (boostId: number, score: number, streak: number) => number = (boostId: number, score: number, streak: number) => {
    switch (boostId) {
        case 1:
            return steadyBoostFunction(score, streak)
        case 2:
            return daringBoostFunction(score, streak)
        case 3:
            return recklessBoostFunction(score, streak)
        default:
            return defaultBoostFunction(score, streak)
    }
}

const isBoostActive: (boostId: number, streak: number) => boolean = (boostId: number, streak: number) => {
    switch (boostId) {
        case 1:
            return true // Steady Boost is always active
        case 2:
            return streak >= 3 // Daring Boost is always active if streak >= 3
        case 3:
            return streak >= 5 // Reckless Boost is always active if streak >= 5
        default:
            return false // No boost active
    }
}

const getBoostStreakRequirement: (boostId: number) => number = (boostId: number) => {
    switch (boostId) {
        case 1:
            return 0 // Steady Boost has no streak requirement
        case 2:
            return 3 // Daring Boost requires a streak of 3 or more
        case 3:
            return 5 // Reckless Boost requires a streak of 5 or more
        default:
            return 0 // No boost active
    }
}

const getBoostMultiplier: (boostId: number) => number = (boostId: number) => {
    switch (boostId) {
        case 1:
            return 1.1
        case 2:
            return 1.3
        case 3:
            return 1.8
        default:
            return 1 // No boost active
    }
}

export {
    type BoostPowerUpFunction,
    defaultBoostFunction,
    steadyBoostFunction,
    daringBoostFunction,
    recklessBoostFunction,
    isBoostActive,
    getBoostMultiplier,
    getBoostStreakRequirement,
    getBoostValue
}