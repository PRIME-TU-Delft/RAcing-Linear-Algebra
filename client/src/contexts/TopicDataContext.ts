import { createContext } from 'react';
import { Exercise, Study, Topic } from '../components/LecturerPlatform/SharedUtils';

interface TopicData {
    allStudies: Study[],
    allTopics: Topic[],
    allExercises: Exercise[]
}

export const TopicDataContext = createContext<TopicData>({
    allStudies: [],
    allTopics: [],
    allExercises: []
})
