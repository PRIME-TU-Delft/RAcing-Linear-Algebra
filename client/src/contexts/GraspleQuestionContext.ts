import { createContext } from 'react';
import { GraspleQuestion } from '../components/RaceThemes/SharedUtils';

interface QuestionData {
    questionData: GraspleQuestion,
    questionNumber: number,
    numberOfMandatory: number
}

export const GraspleQuestionContext = createContext<QuestionData>({
    questionData: {
        difficulty: "",
        subject: "",
        questionUrl: ""
    },
    questionNumber: 0,
    numberOfMandatory: 0
})
