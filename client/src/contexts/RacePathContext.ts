import { createContext } from 'react';
import { RacePathObject } from '../components/RaceThemes/SharedUtils';

export const RacePathContext = createContext<RacePathObject>({
    svgPath: "",
    pathLength: 0,
    components: []
})
