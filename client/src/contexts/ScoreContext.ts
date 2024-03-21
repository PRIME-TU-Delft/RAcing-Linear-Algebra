import { createContext } from 'react';

interface ScoreData {
    currentPoints: number,
    totalPoints: number
}

export const ScoreContext = createContext<ScoreData>({
    currentPoints: 0,
    totalPoints: 1
})
