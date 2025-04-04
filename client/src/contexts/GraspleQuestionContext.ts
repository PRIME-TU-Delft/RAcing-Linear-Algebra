import { createContext } from 'react';
import { GraspleExercise } from '../components/RaceThemes/SharedUtils';

interface QuestionData {
    questionData: GraspleExercise,
    questionNumber: number,
    numberOfMandatory: number,
    pointsToGain: number
}

export const GraspleQuestionContext = createContext<QuestionData>({
    questionData: {
        _id: "",
        name: "",
        exerciseId: 0,
        difficulty: "",
        url: "",
        numOfAttempts: 0,
        isMandatory: false
    },
    questionNumber: 0,
    numberOfMandatory: 0,
    pointsToGain: 0
})
