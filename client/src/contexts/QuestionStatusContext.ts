import { createContext } from 'react';
import { QuestionStatus } from '../components/Game/GameService';
import { faL } from '@fortawesome/free-solid-svg-icons';

export const QuestionStatusContext = createContext<QuestionStatus>({
    questionStarted: false,
    questionFinished: false,
    remainingAttempts: 0,
    newQuestionEvent: () => {}
})