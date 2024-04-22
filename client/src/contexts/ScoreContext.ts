import { createContext } from 'react';

interface ScoreData {
    currentPoints: number,
    totalPoints: number
    currentAccuracy: number
}

export const ScoreContext = createContext<ScoreData>({
    currentPoints: 0,
    totalPoints: 1,
    currentAccuracy: 100
})
