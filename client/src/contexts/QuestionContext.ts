import { createContext } from 'react';
import { IQuestion } from '../components/RaceThemes/SharedUtils';

interface QuestionData {
    iQuestion: IQuestion,
    questionNumber: number,
    numberOfMandatory: number
}

export const QuestionContext = createContext<QuestionData>({
    iQuestion: {
        question: "",
        answer: "",
        difficulty: "",
        subject: "",
        type: "",
        options: [],
        variants: []
    },
    questionNumber: 0,
    numberOfMandatory: 0
})
