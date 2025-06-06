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
"Scalar Slingers", "Nullspace Ninjas"
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
    const scoreMultiplier = 1.0;
    const iterations = Math.floor(roundDuration / avgExpectedTime);
    const raw: number[] = [];
    let cumulative = 0;
  
    for (let i = 0; i < iterations; i++) {
      for (let j = 0; j < numPlayers; j++) {
        const base = numPlayers * scoreMultiplier + 30;
        const variation = (Math.random() - 0.5) * 0.8 * base;
        cumulative += base + variation;
      }
      raw.push(cumulative);
    }
  
    const timepoints = Math.floor(roundDuration / 30);
    const out: number[] = [0]; // t=0
    for (let k = 1; k <= timepoints; k++) {
      const t = k * 30;
      // find which raw-step covers time t
      const idx = Math.min(
        raw.length - 1,
        Math.floor(t / avgExpectedTime) - 1
      );
      const val = idx >= 0 ? raw[idx] : 0;
      out.push(Number((val / (roundDuration * numPlayers)).toFixed(4)));
    }
  
    return out;
  }
  
export function generateFakeScores(
    options: GeneratorOptions
    ): IScore[] {
    const { studies, topicId, numTeams, avgExpectedTime } = options

    if (numTeams < 0 || numTeams > 31) {
        throw new Error("numTeams must be between 1 and 31")
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