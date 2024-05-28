import { createContext } from 'react';

interface ScoreData {
    currentPoints: number,
    totalPoints: number,
    teamAveragePoints: number,
    currentAccuracy: number
}

export const ScoreContext = createContext<ScoreData>({
    currentPoints: 0,
    totalPoints: 1,
    teamAveragePoints: 0,
    currentAccuracy: 100
})
