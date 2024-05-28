import { createContext } from 'react';
import { Checkpoint, Ghost, PercentCoordinate, RaceMap } from '../components/RaceThemes/SharedUtils';

interface RaceData {
    theme: string,
    ghostTeams: Ghost[],
    checkpoints: Checkpoint[]
    selectedMap: RaceMap
}

export const RaceDataContext = createContext<RaceData>({
    theme: "Train",
    ghostTeams: [],
    checkpoints: [],
    selectedMap: {
        backgroundColor: "",
        decorations: [],
        path: []
    }
});
