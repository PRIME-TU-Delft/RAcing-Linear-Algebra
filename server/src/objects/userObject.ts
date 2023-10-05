import type { IQuestion } from "../models/questionModel"

export class User {
    questionIds: string[] //The ids of the questions/variants that have already been used
    questions: Map<IQuestion, { attempts: number; correct: number }> //A map containing all the statistics per question per user correct is 0 for incorrectly and 1 for correctly answered
    currentQuestion: IQuestion //The question this user is currently on
    attempts: number //The amount of attempts on the current question
    score: number //The score of the player
    isOnMandatory: boolean //A check to see if the player is done with the mandatory questions
    streak: number //The current amount of questions answered correctly in a row

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
        this.streak = 0
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

    resetUser() {
        this.questionIds = []
        this.questions = new Map()
        this.attempts = 3
        this.score = 0
        this.isOnMandatory = true
    }
}
