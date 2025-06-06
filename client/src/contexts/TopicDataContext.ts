import { createContext } from 'react';
import { Exercise, Study, Topic } from '../components/LecturerPlatform/SharedUtils';

export interface DefaultTeamsData {
    fakeTeamsCount: number
    totalTeamsCount: number
    topicId: string
}
interface TopicData {
    allStudies: Study[],
    allTopics: Topic[],
    allExercises: Exercise[], 
    defaultTeams: DefaultTeamsData[]
}

export const TopicDataContext = createContext<TopicData>({
    allStudies: [],
    allTopics: [],
    allExercises: [],
    defaultTeams: [],
})
