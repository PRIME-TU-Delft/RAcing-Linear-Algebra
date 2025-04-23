import { getVariantById, parseVariantToQuestion } from "../controllers/questionDBController"
import type { IQuestion } from "../models/questionModel"
import { Statistic } from "./statisticObject"
import type { User } from "./userObject"
import { checkAnswerEqual } from "../latexParser"
import { CurveInterpolator } from 'curve-interpolator';
import type { ITopic } from "../models/topicModel"
import type { IExercise } from "../models/exerciseModel"

export interface GameGhostTeam {
    teamName: string
    timeScores: number[]
    checkpoints: number[]
    study: string
    accuracy: number
}
export class Game {
    avgScore: number //The average score of the team's users
    totalScore: number //The total (sum) score of the team's users
    timeScores: number[]
    teamName: string //The name of the team
    currentTopicIndex: number //Number of the current round that is being played
    topics: ITopic[] //The selected rounds
    roundDurations: number[] // The durations of the rounds
    users: Map<string, User> //The map of users in the game
    checkpoints: number[] //The amount of seconds taken to reach each checkpoint
    study: string //The study of this game
    correct: number //The number of correct answers
    incorrect: number //The number of incorrect answers
    roundStartTime: number //The time the game started
    ghostTeams: GameGhostTeam[] //The ghost teams for this game
    lapEndScore: number // Number of points required to complete a single lap
    numberOfPlayersAtStart: number // Number of players at the start of the game

    /**
     * Constructor for a game object,
     * This object can be used to easily represent a game and all values that need to be stored with it
     * @param topics the selected rounds for this game
     * @param teamName the name of the team
     * @param users a map from socketId to User, to store all the players.
     */
    constructor(topics: ITopic[], roundDurations: number[], teamName: string, users: Map<string, User>, study: string) {
        this.currentTopicIndex = 0
        this.topics = topics
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
     * @param userId the player that needs a new question
     * @param lobbyId the lobby that the player is in
     * @returns the new question
     */
    getNewExercise(userId: string, difficulty?: string): IExercise | undefined {
        const topic = this.topics[this.currentTopicIndex]
        const user = this.users.get(userId)
        if (user === undefined) throw Error("This user is not in this game")
        if (user.isOnMandatory) return this.getMandatoryQuestion(topic, user)
        else if (difficulty !== undefined)
            return this.getDifficultyExercise(topic, user, difficulty)
        else throw Error("No difficulty was given")
    }

    /**
     * Filters the users map to find users which have not disconnected from the game, and returns the number of them
     * @returns the number of currently active users
     */
    getNumberOfActiveUsers(): number {
        return Array.from(this.users.values()).filter(x => !x.disconnected).length
    }

    /**
     * Checks whether the mandatory exercises exist for the current topic
     * @returns whether the topic contains mandatory exercises
     */
    mandatoryExercisesExistForCurrentTopic(): boolean {
        const topic = this.topics[this.currentTopicIndex]
        return topic.mandatoryExercises.length > 0
    }

    /**
     * Makes the user not on mandatory exercises anymore
     * @param userId the user id
     */
    makeUserNotOnMandatory(userId: string): void {
        const user = this.users.get(userId)
        if (user === undefined) throw Error("This user is not in this game")
        user.isOnMandatory = false
    }

    /**
     * Gets a new mandatory question
     * @param topic the current round the user is in
     * @param user the user object that needs a question
     * @returns a new question
     */
    getMandatoryQuestion(topic: ITopic, user: User): IExercise | undefined {
        console.log("Answered: " + user.getQuestionIds().length.toString())
        console.log("Mandatories: " + topic.mandatoryExercises.length.toString())

        const numberOfAnswered = user.getQuestionIds().length
        const question = topic.mandatoryExercises[numberOfAnswered]

        if (question === undefined) throw Error("Could not generate new question")
        user.attempts = question.numOfAttempts
        this.initializeUserAttempts(question, user)
        return question
    }

    /**
     * Checks whether the user has answered all mandatory questions by looking at the number of the questions answered so far
     * @param topic the topic of the current round
     * @param user the user
     * @returns whether the user has answered all mandatory questions
     */
    allMandatoryQuestionsAnswered(userId: string): boolean {
        const topic = this.topics[this.currentTopicIndex]
        const user = this.users.get(userId)
        if (user === undefined) return false

        const numberOfAnswered = user.getQuestionIds().length
        if (numberOfAnswered >= topic.mandatoryExercises.length)
            return true

        return false
    }

    /**
     * Checks whether the user has started answering a non-mandatory question, relevant for reconnecting users
     * @param userId the id of the user
     * @returns whether the user has started answering a difficulty-based (non-mandatory) question
     */
    hasUserAttemptedNonMandatoryQuestion(userId: string): boolean {
        const topic = this.topics[this.currentTopicIndex]
        const user = this.users.get(userId)
        if (user === undefined) return false

        const numberOfAnswered = user.getQuestionIds().length
        if (numberOfAnswered >= topic.mandatoryExercises.length + 1)
            return true

        return false
    }

    /**
     * Gets a new exercise based on the seleced difficulty
     * @param round the current round the user is in
     * @param user the user object that needs a question
     * @param difficulty the difficulty of the new question
     * @returns a new exercise
     */
    getDifficultyExercise(
        topic: ITopic,
        user: User,
        difficulty: string
    ): IExercise | undefined {
        try {
            const exerciseIds = topic.difficultyExercises
                .filter((x) => x.difficulty.toLowerCase() === difficulty.toLowerCase())
                .map((x) => x.exerciseId)

            const exerciseId = user.getRandomQuestionId(exerciseIds)
            const exercise = topic.difficultyExercises.find((x) => x.exerciseId === exerciseId)
            if (exercise === undefined) throw Error("An exercise with this id could not be found")
            user.attempts = exercise.numOfAttempts
        this.initializeUserAttempts(exercise, user)
            return exercise
        } catch (error) {
            throw error
        }
    }

    /**
     * Checks whether the user answered all questions from all difficulties
     * @param userId the id of the user
     * @returns whether all questions have been answered
     */
    checkIfUserAnsweredAllQuestions(userId: string) {

        const user = this.users.get(userId)
        if (user === undefined) throw Error("This user is not in this game")
        
        const topic = this.topics[this.currentTopicIndex]

        const difficulties = ["easy", "medium", "hard"]
        let answeredAllQuestions = true

        difficulties.forEach(difficulty => {
            const answeredAllForDifficulty = this.checkIfUserAnsweredAllQuestionsOfDifficulty(userId, difficulty)
            answeredAllQuestions = answeredAllQuestions && answeredAllForDifficulty
        })
        
        return answeredAllQuestions
    }

    /**
     * Checks whether the user answered all questions of a particular difficulty
     * @param userId the user id
     * @param difficulty the difficulty to check
     * @returns whether the user answered all questions of a difficulty
     */
    checkIfUserAnsweredAllQuestionsOfDifficulty(userId: string, difficulty?: string) {
        if (difficulty == undefined) return false

        const user = this.users.get(userId)
        if (user === undefined) throw Error("This user is not in this game")

        const topic = this.topics[this.currentTopicIndex]
        const exerciseIds = topic.difficultyExercises
                .filter((x) => x.difficulty.toLowerCase() === difficulty.toLowerCase())
                .map((x) => x.exerciseId)

        return user.checkIfUsedUpAllVariantsForDifficulty(exerciseIds)
    }

    /**
     * Event triggered when all of the questions have been answered by the user
     * @param userId user id
     */
    onUserAnsweredAllQuestions(userId: string) {
        const user = this.users.get(userId)
        if (user === undefined) throw Error("This user is not in this game")
        
        user.resetUserQuestionsAnswered()
    }

    initializeUserAttempts(exericse: IExercise, user: User) {
        user.currentQuestion = exericse
        user.questions = user.questions.set(exericse, { attempts: 0, correct: 0 })
    }

    hasUserJoinedLate(userId: string): boolean {
        const user = this.users.get(userId)
        if (user === undefined) throw Error("This user is not in this game")
        return user.lastConnectionTime > this.roundStartTime
    }

    /**
     * Checks the answer for a user
     * @param userId the user
     * @param answer the answer from the user
     * @returns boolean depending on correctness of the answer
     */
    processUserAnswer(userId: string, answeredCorrectly: boolean, questionDifficulty: string): number {
        console.log(userId)
        const user = this.users.get(userId)
        if (user === undefined) throw Error("This user is not in this game")

        const question = user.currentQuestion
        const usedAttempts = user.questions.get(question)?.attempts ?? 0
        let score = 0

        //Case of incorrect answer
        if (!answeredCorrectly) {
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
            score = this.calculateScore(question, user)
            user.continueUserStreak(questionDifficulty)
            user.score += score
            this.totalScore += score
            this.avgScore = this.totalScore / this.getNumberOfActiveUsers()

            user.attempts = 3
            this.correct++
            //Sets the correctlyAnswered value to 1
            user.questions = user.questions.set(question, { attempts: usedAttempts, correct: 1 })
        }
        return score
    }

    /* Calculates the score a player will receive for answering a question
     * @param question the question that has been answered
     * @param user the user that answered the question
     * @returns the amount of score gained
     */
    
    calculateScore(exercise: IExercise, user: User) {
        const difficulty = exercise.difficulty.toLowerCase()
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
        const numberOfPlayers = Math.max(this.getNumberOfActiveUsers(), this.numberOfPlayersAtStart)
        const roundDuration = this.roundDurations[this.currentTopicIndex]

        const newTimeScore = currentTotalScore / (numberOfPlayers * roundDuration)
        this.timeScores.push(newTimeScore)
    }

    /**
     * Gets the interpolated score points for a given ghost team scores
     * @param ghostTeamScores the time scores array of the ghost team
     * @param deltaT the delta T being used
     * @returns a list of interpolated points for the given round to be used for this ghost team
     */
    getGhostTeamTimePointScores(ghostTeamScores: number[]) {
        const numberOfTimePoints = Math.floor(this.roundDurations[this.currentTopicIndex] / 20)
        const points = ghostTeamScores.map((x, index) => [index * 30, x])
        const interp = new CurveInterpolator(points, { tension: 0.2, alpha: 0.5 });
        const timePoints = this.getTimePointsForTeam(numberOfTimePoints)

        const result = timePoints.map(x => ({
            timePoint: x,
            score: interp.getPointAt(x / this.roundDurations[this.currentTopicIndex])[1] * this.roundDurations[this.currentTopicIndex] * this.getNumberOfActiveUsers()
        }))

        // Modify the score of the last element
        const lastElement = result[result.length - 1]
        lastElement.score = ghostTeamScores[ghostTeamScores.length - 1] * this.roundDurations[this.currentTopicIndex] * this.getNumberOfActiveUsers()
        result[result.length - 1] = lastElement

        return result
    }

    /**
     * Gets a random distribution of time points across the round duration interval that are to be used for score updating
     * @param numberOfTimePoints the number of time points to generate
     * @returns an array of time points in seconds across the interval
     */
    getTimePointsForTeam(numberOfTimePoints: number) {
        const timePoints: number[] = [];
        const maxDuration = this.roundDurations[this.currentTopicIndex] * 1000; // Convert duration to milliseconds
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
        return ghostTeamScores.map(x => x[1] * this.getNumberOfActiveUsers() * this.roundDurations[this.currentTopicIndex])
    }

    /**
     * Helper function to check if the mandatory questions are done for a user
     * @param userId the player to check for
     * @returns if user has already asnwered x mandatory questions
     */
    isMandatoryDone(userId: string): boolean {
        const user = this.users.get(userId)
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
                        question,
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
     * Checks how many attempts a user has left
     * @param userId the id of the user
     * @returns the amount of attempts remaining
     */
    attemptChecker(userId: string): number {
        const user = this.users.get(userId)
        if (user === undefined) throw Error("This user is not in this game")
        return user.attempts
    }

    /**
     * Gets the amount of mandatory questions in this round
     * @returns the amount of mandatory questions
     */
    getMandatoryNum(): number {
        const topic = this.topics[this.currentTopicIndex]
        return topic.mandatoryExercises.length
    }
}
