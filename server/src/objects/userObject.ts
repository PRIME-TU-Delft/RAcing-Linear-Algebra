import { number } from "mathjs";
import type { IQuestion } from "../models/questionModel"
import { Streak } from "./streakObject";
import { IExerciseWithPopulatedVariants } from "../controllers/topicVariantsDBController";

export class User {
    questions: Map<IExerciseWithPopulatedVariants, { attempts: number; correct: number }> //A map containing all the statistics per question per user correct is 0 for incorrectly and 1 for correctly answered
    currentQuestion: IExerciseWithPopulatedVariants //The question this user is currently on
    attempts: number //The amount of attempts on the current question
    score: number //The score of the player
    isOnMandatory: boolean //A check to see if the player is done with the mandatory questions
    streaks: Streak[] // Array of streak objects for the user
    socketId: string //The socket id of the user
    disconnected: boolean
    usedUpAttemptsOnLastQuestion: boolean // boolean used to prevent initial bug where multiple new questions are inconsistenly requested
    lastConnectionTime: number // timestamp of the last connection time

    /**
     * Constructor for the user object
     * Initializes all the values
     */
    constructor() {
        this.questions = new Map()
        this.attempts = 3
        this.score = 0
        this.isOnMandatory = true
        this.initializeUserStreaks()
        this.socketId = ""
        this.disconnected = false
        this.usedUpAttemptsOnLastQuestion = false
        this.lastConnectionTime = Date.now() - 60000 // 1 minute ago (to ensure possibility of reconnection initially, refer to socket connection reconnect segment)
    }

    getQuestionIds(): number[] {
        return Array.from(this.questions.keys()).map((exercise) => exercise.exerciseId);
    }

    /**
     * Initialize the streak objects for the 3 question difficulties
     */
    initializeUserStreaks() {
        const initialized_streaks = [
            new Streak("easy"),
            new Streak("medium"),
            new Streak("hard")
        ]

        this.streaks = initialized_streaks
    }

   /**
    * Gets a random question the user hasn't answered yet from the provided list of possible questions
    * @param questions the possible questions from which to check
    * @returns a random exerciseId or -1 if none are available
    */
    getRandomUnseenQuestionIfExists(questions: number[]): number {
        let size = questions.length
        let flag = false
        let question = -1
        while (!flag && size !== 0) {
            const randomIndex = Math.floor(Math.random() * size)
            question = questions[randomIndex]
            size--
            if (this.getQuestionIds().includes(question)) {
                questions.splice(randomIndex, 1)
            } else {
                flag = true
            }
        }

        if (!flag) {
            return -1
        }

        return question
    }

    /**
     * Gets a random questionId without getting a duplicate
     * @param questions the list of questionIds to chose 1 from
     * @returns 1 random chosen exercise
     */
    getRandomQuestionId(questions: number[]): number {
        const question = this.getRandomUnseenQuestionIfExists(questions)
        if (question == -1) {
            throw Error("All variants have been used already")
        } else {
            return question
        }
    }

    checkIfUsedUpAllVariantsForDifficulty(questions: number[]): boolean {
        return questions.every(question => this.getQuestionIds().includes(question))
    }

    /**
     * Resets the streak of the user for a particular question difficulty.
     * @param difficulty difficulty of the answered question
     * @returns void
     */
    resetUserStreak(difficulty: string) {
        const streak = this.getStreakForDifficulty(difficulty)

        if (!streak) 
            return

        streak.resetStreak()
    }

     /**
     * Updates the streak of the user for a particular question difficulty.
     * @param difficulty difficulty of the answered question
     * @returns void
     */
    continueUserStreak(difficulty: string) {
        const streak = this.getStreakForDifficulty(difficulty)
        if (!streak) 
            return

        streak.continueStreak()
    }

    /**
     * Retrieves the multiplier of the streak for a particular question difficulty
     * @param difficulty difficulty of the answered question
     * @returns the multiplier of the streak
     */
    getStreakMultiplier(difficulty: string): number {
        const streak = this.getStreakForDifficulty(difficulty)

        if (!streak)
            return 1
        
        return streak.streakMultiplier
    }

    /**
     * Retrieves the affected streak from the streaks array, based on the question difficulty.
     * @param difficulty difficulty of the answered question
     * @returns the affected streak
     */
    getStreakForDifficulty(difficulty: string) {
        const filtered_streak_indices = this.streaks.map((x, i) => i).filter(i => this.streaks[i].questionType == difficulty)

        if (filtered_streak_indices.length > 0)
            return this.streaks[filtered_streak_indices[0]]
        else
            return null
    }

    resetUser() {
        this.questions = new Map()
        this.attempts = 3
        this.score = 0
        this.isOnMandatory = true
        this.streaks.map((streak: Streak) => streak.resetStreak())
        this.usedUpAttemptsOnLastQuestion = false
    }

    resetUserQuestionsAnswered() {
        this.questions = new Map()
    }
}
