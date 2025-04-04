import { createContext } from 'react';

interface DifficultyAvailability {
    easy: boolean;
    medium: boolean;
    hard: boolean;
}

export type { DifficultyAvailability };
export const DifficultyAvailabilityContext = createContext<DifficultyAvailability>({
    easy: false,
    medium: false,
    hard: false,
});