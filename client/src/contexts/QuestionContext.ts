import { createContext } from 'react';
import { IQuestion } from '../components/RaceThemes/SharedUtils';

export const QuestionContext = createContext<IQuestion>({
    question: "",
    answer: "",
    difficulty: "",
    subject: "",
    type: "",
    options: [],
    variants: []
})
