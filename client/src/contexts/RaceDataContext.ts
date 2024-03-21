import { createContext } from 'react';
import { Checkpoint, Ghost } from '../components/RaceThemes/SharedUtils';

interface RaceData {
    mapDimensions: {
        width: number,
        height: number
    },
    theme: string,
    ghostTeams: Ghost[],
    checkpoints: Checkpoint[]
}

export const RaceDataContext = createContext<RaceData>({
    mapDimensions: {
        width: 0,
        height: 0
    },
    theme: "Train",
    ghostTeams: [],
    checkpoints: []
});
