import { IExerciseWithPopulatedVariants } from "../controllers/topicVariantsDBController"
import { IExercise } from "../models/exerciseModel"

export class Statistic {
    question: IExerciseWithPopulatedVariants
    difficulty: string
    correctlyAnswered: number
    incorrectlyAnswered: number

    /**
     * Constructor for statistics
     * @param question the question
     * @param answer the answer to the question
     * @param difficulty the difficulty of the question
     * @param correctlyAnswered the amount of correct answers given
     * @param incorrectlyAnswered the amount of incorrect answers given
     */
    constructor(question, difficulty, correctlyAnswered, incorrectlyAnswered) {
        this.question = question
        this.difficulty = difficulty
        this.correctlyAnswered = correctlyAnswered
        this.incorrectlyAnswered = incorrectlyAnswered
    }
}
