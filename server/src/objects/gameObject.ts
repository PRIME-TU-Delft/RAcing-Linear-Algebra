import { getVariantById, parseVariantToQuestion } from "../controllers/questionDBController"
import type { IQuestion } from "../models/questionModel"
import type { IRound } from "../models/roundModel"
import { Statistic } from "./statisticObject"
import type { User } from "./userObject"
import { checkAnswerEqual } from "../latexParser"
import { CurveInterpolator } from 'curve-interpolator';

export class Game {
    avgScore: number //The average score of the team's users
    totalScore: number //The total (sum) score of the team's users
    timeScores: number[]
    teamName: string //The name of the team
    round: number //Number of the current round that is being played
    rounds: IRound[] //The selected rounds
    roundDurations: number[] // The durations of the rounds
    users: Map<string, User> //The map of users in the game
    checkpoints: number[] //The amount of seconds taken to reach each checkpoint
    study: string //The study of this game
    correct: number //The number of correct answers
    incorrect: number //The number of incorrect answers

    /**
     * Constructor for a game object,
     * This object can be used to easily represent a game and all values that need to be stored with it
     * @param rounds the selected rounds for this game
     * @param teamName the name of the team
     * @param users a map from socketId to User, to store all the players.
     */
    constructor(rounds: IRound[], roundDurations: number[], teamName: string, users: Map<string, User>, study: string) {
        this.round = 0
        this.rounds = rounds
        this.roundDurations = roundDurations
        this.teamName = teamName
        this.avgScore = 0
        this.totalScore = 0
        this.timeScores = []
        this.users = users
        this.checkpoints = []
        this.study = study
        this.correct = 0
        this.incorrect = 0
    }

    /**
     * Adds a new checkpoint to the list of checkpoints
     * @param seconds the time it took to reach this checkpoint
     */
    addCheckpoint(seconds: number) {
        const checkpoints = this.checkpoints
        checkpoints.push(seconds)
        this.checkpoints = checkpoints
    }

    /**
     * Gets a new question for a certain player and adds it to the array of used questions
     * @param socketId the player that needs a new question
     * @param lobbyId the lobby that the player is in
     * @returns the new question
     */
    async getNewQuestion(socketId: string, difficulty?: string): Promise<IQuestion | undefined> {
        const round = this.rounds[this.round]
        const user = this.users.get(socketId)
        if (user === undefined) throw Error("This user is not in this game")
        if (user.isOnMandatory) return await this.getMandatoryQuestion(round, user)
        else if (difficulty !== undefined)
            return await this.getBonusQuestion(round, user, difficulty)
        else throw Error("No difficulty was given")
    }

    /**
     * Gets a new mandatory question
     * @param round the current round the user is in
     * @param user the user object that needs a question
     * @returns a new question
     */
    async getMandatoryQuestion(round: IRound, user: User): Promise<IQuestion | undefined> {
        const numberOfAnswered = user.questionIds.length
        const question = round.mandatory_questions[numberOfAnswered]
        if (question === undefined) throw Error("Could not generate new question")
        this.attemptSetter(user, "mandatory", question.type)
        //Check if after adding this question all the mandatories are done
        if (numberOfAnswered + 1 >= round.mandatory_questions.length) user.isOnMandatory = false
        try {
            return await this.variantToQuestion(question, user)
        } catch (error) {
            throw error
        }
    }

    /**
     * Gets a new bonus question
     * @param round the current round the user is in
     * @param user the user object that needs a question
     * @param difficulty the difficulty of the new question
     * @returns a new question
     */
    async getBonusQuestion(
        round: IRound,
        user: User,
        difficulty: string
    ): Promise<IQuestion | undefined> {
        try {
            const questionIds = round.bonus_questions
                .filter((x) => x.difficulty === difficulty)
                .map((x) => x.id)
            const questionId = user.getRandomQuestionId(questionIds)
            const question = round.bonus_questions.find((x) => x.id === questionId)
            if (question === undefined) throw Error("A question with this id could not be found")
            this.attemptSetter(user, difficulty, question.type)
            const res = await this.variantToQuestion(question, user)
            return res
        } catch (error) {
            throw error
        }
    }

    /**
     * Function that takes a question, gets a random variant of it and parses it to the correct question and answer string
     * @param question the question to get a variant from
     * @param user the user that needs a variant
     * @returns the variant of the question
     */
    async variantToQuestion(question: IQuestion, user: User): Promise<IQuestion | undefined> {
        try {
            if (question.variants !== undefined && question.variants.length !== 0) {
                const variant = user.getRandomQuestionId(question.variants)
                const variantDocument = await getVariantById(variant, question.subject)
                if (variantDocument === undefined) throw Error("Variant was not found")
                const result = parseVariantToQuestion(variantDocument, question)
                user.currentQuestion = result
                user.questions = user.questions.set(result, { attempts: 0, correct: 0 })
                user.questionIds.push(variant)
                return result
            } else {
                user.currentQuestion = question
                user.questions = user.questions.set(question, { attempts: 0, correct: 0 })
                user.questionIds.push(question.id)
                return question
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * Checks the answer for a user
     * @param socketId the user
     * @param answer the answer from the user
     * @returns boolean depending on correctness of the answer
     */
    checkAnswer(socketId: string, answer: any, questionDifficulty: string): (boolean | number)[] {
        const user = this.users.get(socketId)
        if (user === undefined) throw Error("This user is not in this game")

        const question = user.currentQuestion
        const finalAnswer = question.answer
        const result = checkAnswerEqual(question, finalAnswer, answer)
        const usedAttempts = user.questions.get(question)?.attempts ?? 0
        let score = 0

        //Case of incorrect answer
        if (!result) {
            user.attempts--
            if (user.attempts === 0) this.incorrect++
            user.resetUserStreak(questionDifficulty)
            //Increases the amount of attempts used for this question
            user.questions = user.questions.set(question, {
                attempts: usedAttempts + 1,
                correct: 0,
            })
        } else {
            //Calculate score and update values
            user.continueUserStreak(questionDifficulty)
            score = this.calculateScore(question, user)
            user.score += score
            this.totalScore += score
            this.avgScore = this.totalScore / this.users.size

            user.attempts = 3
            this.correct++
            //Sets the correctlyAnswered value to 1
            user.questions = user.questions.set(question, { attempts: usedAttempts, correct: 1 })
        }
        return [result, score]
    }

    /* Calculates the score a player will receive for answering a question
     * @param question the question that has been answered
     * @param user the user that answered the question
     * @returns the amount of score gained
     */
    calculateScore(question: IQuestion, user: User) {
        const difficulty = question.difficulty
        const difficulties = ["easy", "medium", "hard", "mandatory"]
        const scores = [10, 50, 150, 50]

        const scoreIdx = difficulties.indexOf(difficulty)
        if (scoreIdx == -1) {
            throw new Error("The difficulty of this question is invalid")
        }

        let score = scores.at(scoreIdx)
        if (score == undefined)
            score = 0
        
        const multiplier = user.getStreakMultiplier(difficulty)

        return score * multiplier
    }

    /**
     * Calculates and stores the current score into the list of time scores
     * The value is scaled down based on player number and round duration
     */
    addNewTimeScore() {
        const currentTotalScore = this.totalScore
        const numberOfPlayers = this.users.size
        const roundDuration = this.roundDurations[this.round]

        const newTimeScore = currentTotalScore / (numberOfPlayers * roundDuration)
        this.timeScores.push(newTimeScore)
        console.log(this.timeScores)
    }

    /**
     * Gets the interpolated score points for a given ghost team scores
     * @param ghostTeamScores the time scores array of the ghost team
     * @param deltaT the delta T being used
     * @returns a list of interpolated points for the given round to be used for this ghost team
     */
    getGhostTeamTimePointScores(ghostTeamScores: number[]) {
        const numberOfTimePoints = Math.floor(this.roundDurations[this.round] / 20)
        const points = ghostTeamScores.map((x, index) => [index * 30, x])
        const interp = new CurveInterpolator(points, { tension: 0.2, alpha: 0.5 });
        const timePoints = this.getTimePointsForTeam(numberOfTimePoints)

        const result = timePoints.map(x => ({
            timePoint: x,
            score: interp.getPointAt(x / this.roundDurations[this.round])[1] * this.roundDurations[this.round] * this.users.size
        }))

        // Modify the score of the last element
        const lastElement = result[result.length - 1]
        lastElement.score = ghostTeamScores[ghostTeamScores.length - 1] * this.roundDurations[this.round] * this.users.size
        result[result.length - 1] = lastElement

        console.log(result)

        return result
    }

    /**
     * Gets a random distribution of time points across the round duration interval that are to be used for score updating
     * @param numberOfTimePoints the number of time points to generate
     * @returns an array of time points in seconds across the interval
     */
    getTimePointsForTeam(numberOfTimePoints: number) {
        const timePoints: number[] = [];
        const maxDuration = this.roundDurations[this.round] * 1000; // Convert duration to milliseconds
        let currentTime = 0;
      
        for (let i = numberOfTimePoints + 1; i > 1; i--) {
            // Generate a random number between 0.5 and 2
            const factor = Math.random() * 1.5 + 0.5;
            const averageInterval = (maxDuration - currentTime) / i;
            // Calculate the interval based on the factor
            const intervalTime = averageInterval * factor;
            currentTime += intervalTime;
            if (currentTime < maxDuration) {
                timePoints.push(currentTime);
            }
        }
      
        return timePoints.map((time) => Math.floor(time / 1000)); // Convert back to seconds
    }

    /**
     * Transforms the normalized score values into the appropriate values for the current round
     * @param ghostTeamScores the array of points given by the curve interpolation library
     *  representing interpolated ghost team scores
     * @returns the scaled up values for the scores based on current number of players and round duration
     */
    transformGhostTeamScoresForCurrentRound(ghostTeamScores: number[][]) {
        return ghostTeamScores.map(x => x[1] * this.users.size * this.roundDurations[this.round])
    }

    /**
     * Helper function to check if the mandatory questions are done for a user
     * @param socketId the player to check for
     * @returns if user has already asnwered x mandatory questions
     */
    isMandatoryDone(socketId: string): boolean {
        const user = this.users.get(socketId)
        if (user === undefined) throw Error("This user is not in this game")
        return !user.isOnMandatory
    }

    /**
     * Computes the statistics for an entire round
     * This includes adding up all the incorrectly and correctly given answers for a question
     * All the parameterized questions are added up together and displayed with any 1 of the variants
     * So then we store the question and answer of 1 random variant with the difficulty and all the stats and return it
     * @returns the statistics for the game
     */
    calculateStatistics() {
        //The value of the map [Question, Answer, Difficulty, Answered, Attempts]
        const res: Map<string, Statistic> = new Map()

        const users = Array.from(this.users.values())
        for (const user of users) {
            const entries = Array.from(user.questions.entries())
            for (const entry of entries) {
                const question = entry[0]
                const attempts: number = entry[1].attempts
                const correct: number = entry[1].correct
                const currentAnswered = res.get(question.id)?.correctlyAnswered ?? 0
                const currentAttempts = res.get(question.id)?.incorrectlyAnswered ?? 0
                res.set(
                    question.id,
                    new Statistic(
                        question.question,
                        question.answer,
                        question.difficulty,
                        currentAnswered + correct,
                        currentAttempts + attempts
                    )
                )
            }
        }

        return Array.from(res.values())
    }

    /**
     * Sets the number of attempts for a user depending on the difficulty of the question. The system is as follows:
     * Hard or mandatory questions: 3 attempts
     * Medium questions: 2 attempt
     * Easy questions: 1 attempt
     * @param user the user object that needs a question
     * @param type the type of the question
     * @param options the number of options for the multiple choice question
     */
    attemptSetter(user: User, difficulty: string, type: string): void {
        if (user === undefined) throw Error("This user is not in this game")
        if (type === "true/false") {
            user.attempts = 1
            return
        }
        switch (difficulty) {
            case "mandatory" || "hard":
                user.attempts = 3
                break
            case "medium":
                user.attempts = 2
                break
            case "easy":
                user.attempts = 1
                break
            default:
                user.attempts = 3
        }
    }

    /**
     * Checks how many attempts a user has left
     * @param socketId the socket id of the user
     * @returns the amount of attempts remaining
     */
    attemptChecker(socketId: string): number {
        const user = this.users.get(socketId)
        if (user === undefined) throw Error("This user is not in this game")
        return user.attempts
    }

    /**
     * Gets the amount of mandatory questions in this round
     * @returns the amount of mandatory questions
     */
    getMandatoryNum(): number {
        const round = this.rounds[this.round]
        return round.mandatory_questions.length
    }
}
