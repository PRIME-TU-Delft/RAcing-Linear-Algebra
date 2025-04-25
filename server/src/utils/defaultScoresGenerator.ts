import type { IScore } from "../models/scoreModel"

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface GeneratorOptions {
studies: string[]
topicId: string
numTeams: number
avgExpectedTime: number
}

const defaultTeamNames = [
"Matrix Masters", "Vector Victors", "Eigen Elite", "Scalar Sprinters",
"Determinant Dynamos", "Linear Legends", "Nullspace Navigators",
"Eigenvalue Experts", "Basis Blazers", "Orthogonal Olympians",
"Span Speedsters", "Column Space Champs", "Gaussian Gunners",
"Kernel Kings", "Transpose Titans", "Rank Racers", "Adjoint Aces",
"Singular Sensations", "Cofactor Commanders", "Spanning Set Striders",
"Inverse Invincibles", "Orthogonal Operators", "Nullity Navigators",
"Basis Breakthroughs", "Column Clutch", "Determinant Daredevils",
"Vector Vandals", "Matrix Mavericks", "Eigenvalue Emissaries",
"Scalar Slingers"
]

// const difficultySettings: Record<Difficulty, {
// scoreMultiplier: number
// accuracyRange: [min: number, max: number]
// }> = {
// easy:   { scoreMultiplier: 1.2, accuracyRange: [80, 100] },
// medium: { scoreMultiplier: 1.0, accuracyRange: [60,  90] },
// hard:   { scoreMultiplier: 0.8, accuracyRange: [40,  80] },
// }

const getNumberOfPlayers = (): number =>
    Math.floor(Math.random() * 25) + 5

const getDuration = (): number => {
const randomFactor = Math.floor(Math.random() * 20)
return 300 + randomFactor * 30
}

const randInt = (min: number, max: number): number =>
Math.floor(Math.random() * (max - min + 1)) + min

// Gets random accuracy from the set range
const getAccuracy = (): number => {
// const [min, max] = difficultySettings[difficulty].accuracyRange
return randInt(60, 100)
}

const generateScores = (
    numPlayers: number,
    roundDuration: number,
    avgExpectedTime: number,
    ): number[] => {
    const scoreMultiplier = 1.0

    const iterations = Math.floor(roundDuration / avgExpectedTime)
    const scores: number[] = [0]
    let cumulative = 0

    for (let i = 1; i <= iterations; i++) {
        for (let j = 1; j <= numPlayers; j++) {
            const base = numPlayers * scoreMultiplier
            const variation = (Math.random() - 0.5) * 0.8 * base
            cumulative += base + variation
        }
        scores.push(Math.max(0, Number(cumulative.toFixed(2))))
        }

    return scores.map(x =>
        Number((x / (roundDuration * numPlayers)).toFixed(4))
        );
}

export function generateFakeScores(
    options: GeneratorOptions
    ): IScore[] {
    const { studies, topicId, numTeams, avgExpectedTime } = options

    if (numTeams < 1 || numTeams > 18) {
        throw new Error("numTeams must be between 1 and 18")
    }
    if (!studies.length) {
        throw new Error("You must supply at least one study")
    }
    if (!topicId) {
        throw new Error("You must supply a topic ID")
    }

    // randomly pick N distinct team names
    const selectedTeamNames = defaultTeamNames
        .sort(() => 0.5 - Math.random())
        .slice(0, numTeams)

    const allScores: IScore[] = []

    for (const teamname of selectedTeamNames) {
        const study = studies[Math.floor(Math.random() * studies.length)]
        const roundDuration = getDuration()
        const numPlayers = getNumberOfPlayers()
        const scores = generateScores(numPlayers, roundDuration, avgExpectedTime)
        const accuracy = getAccuracy()

        allScores.push({
            teamname,
            scores,
            checkpoints: [],
            topicId,
            roundDuration,
            study,
            accuracy,
            isFakeTeam: true,
        } as any)
    }

    return allScores
}