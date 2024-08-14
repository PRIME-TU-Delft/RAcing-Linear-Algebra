import type { IQuestion } from "../models/questionModel"
import { Streak } from "./streakObject";

export class User {
    questionIds: string[] //The ids of the questions/variants that have already been used
    questions: Map<IQuestion, { attempts: number; correct: number }> //A map containing all the statistics per question per user correct is 0 for incorrectly and 1 for correctly answered
    currentQuestion: IQuestion //The question this user is currently on
    attempts: number //The amount of attempts on the current question
    score: number //The score of the player
    isOnMandatory: boolean //A check to see if the player is done with the mandatory questions
    streaks: Streak[] // Array of streak objects for the user

    /**
     * Constructor for the user object
     * Initializes all the values
     */
    constructor() {
        this.questionIds = []
        this.questions = new Map()
        this.attempts = 3
        this.score = 0
        this.isOnMandatory = true
        this.initializeUserStreaks()
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
     * Gets a random questionId without getting a duplicate
     * @param questions the list of questionIds to chose 1 from
     * @returns 1 random chosen questionId
     */
    getRandomQuestionId(questions: string[]): string {
        let size = questions.length
        let flag = false
        let question = ""
        while (!flag && size !== 0) {
            const randomIndex = Math.floor(Math.random() * size)
            question = questions[randomIndex]
            size--
            if (this.questionIds.includes(question)) {
                questions.splice(randomIndex, 1)
            } else {
                flag = true
            }
        }
        if (!flag) {
            throw Error("All variants have been used already")
        }

        return question
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
        this.questionIds = []
        this.questions = new Map()
        this.attempts = 3
        this.score = 0
        this.isOnMandatory = true
        this.streaks.map((streak: Streak) => streak.resetStreak())
    }
}
