import { createContext } from 'react';

interface ChoosingDifficulty {
    choosingDifficulty: boolean,
    setChoosingDifficulty: React.Dispatch<React.SetStateAction<boolean>>
}

export const ChoosingDifficultyContext = createContext<ChoosingDifficulty>({
    choosingDifficulty: false,
    setChoosingDifficulty: () => {}
})
