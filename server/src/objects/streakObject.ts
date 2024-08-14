// The QuestionType value corresponds to the question difficulty
enum QuestionType {
    Easy = 0,
    Medium,
    Hard
}

export class Streak {
    questionType: QuestionType
    streakValue: number
    streakMultiplier: number

    /**
     * Initializes the streak object.
     * 
     * @param questionType difficulty of the questions the streak corresponds to
     */
    constructor(questionType: QuestionType) {
        this.questionType = questionType
        this.resetStreak()
    }

    /**
     * Resets the streak to initial values.
     *  - Streak value is set to 0 (no streak)
     *  - Streak multiplier is set to 1 (doesn't modify the base value)
     */
    resetStreak() {
        this.streakValue = 0
        this.streakMultiplier = 1
    }

    /**
     * Called when the streak is sucessfully continued, thus increasing the values and multipliers.
     * 
     * The multiplier varies in the range [1, 1.5], linearly increasing in increments of 0.1
     * per streak increment (but being capped at 1.5)
     */
    continueStreak() {
        this.streakValue++
        this.streakMultiplier = Math.min(1 + this.streakValue / 10, 1.5)
    }
}
