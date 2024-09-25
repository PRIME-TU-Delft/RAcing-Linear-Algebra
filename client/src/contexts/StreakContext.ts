import { createContext } from 'react';
import { Streak } from '../components/RaceThemes/SharedUtils';

export const StreakContext = createContext<Streak[]>([])