import { ExerciseStat, IExerciseStat } from "../models/exerciseStatModel"
import { ObjectId } from "mongodb"

/**
 * Saves a new exercise answering statistic to the database
 */
export async function saveExerciseStat(
    userId: string,
    exerciseId: string,
    topicId: string,
    attemptTimes: number[],
    incorrectAttempts: number,
    totalAttempts: number,
    solved: boolean
): Promise<IExerciseStat> {
    const newStat: IExerciseStat = new ExerciseStat({
        userId,
        exerciseId: new ObjectId(exerciseId),
        topicId: new ObjectId(topicId),
        attemptTimes,
        incorrectAttempts,
        totalAttempts,
        solved,
    })
    return await ExerciseStat.create(newStat)
}

/**
 * Gets all exercise stats for a given user
 */
export async function getExerciseStatsByUser(userId: string): Promise<IExerciseStat[]> {
    return await ExerciseStat.find({ userId })
        .populate("exerciseId")
        .populate("topicId")
}

/**
 * Gets all exercise stats for a given topic
 */
export async function getExerciseStatsByTopic(topicId: string): Promise<IExerciseStat[]> {
    return await ExerciseStat.find({ topicId: new ObjectId(topicId) })
        .populate("exerciseId")
        .populate("topicId")
}

/**
 * Gets all exercise stats for a given user within a specific topic
 */
export async function getExerciseStatsByUserAndTopic(
    userId: string,
    topicId: string
): Promise<IExerciseStat[]> {
    return await ExerciseStat.find({ userId, topicId: new ObjectId(topicId) })
        .populate("exerciseId")
        .populate("topicId")
}

/**
 * Gets all exercise stats for a specific exercise across all users
 */
export async function getExerciseStatsByExercise(exerciseId: string): Promise<IExerciseStat[]> {
    return await ExerciseStat.find({ exerciseId: new ObjectId(exerciseId) })
        .populate("exerciseId")
        .populate("topicId")
}
