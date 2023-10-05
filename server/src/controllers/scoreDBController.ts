import { Score } from "../models/scoreModel"
import type { IScore } from "../models/scoreModel"

const { MongoClient } = require("mongodb")

export async function saveNewScore(
    teamname: string,
    score: number,
    checkpoints: number[],
    roundId: string,
    study: string,
    accuracy: number
) {
    const newScore: IScore = new Score({
        teamname,
        score,
        checkpoints,
        roundId,
        study,
        accuracy,
    })

    await Score.create(newScore)
}

export async function getAllScores(roundId: string): Promise<IScore[]> {
    try {
        const result: IScore[] = await Score.find({ roundId: roundId })
        return result
    } catch (error) {
        throw error
    }
}

/**
 * This function gets all the checkpoint for a certain round at a certain checkpoint
 * @param roundId the id of the round that is being played
 * @param checkpointIndex the index of the checkpoint we want
 * @returns all the times at the current checkpoint
 */
export async function getCheckpoints(
    roundId: string,
    checkpointIndex: number
): Promise<(string | number)[][]> {
    try {
        const IScores: IScore[] = await Score.find({ roundId: roundId })
        const teamnames: string[] = []
        const checkpoints: number[] = []

        for (const score of IScores) {
            teamnames.push(score.teamname)
            checkpoints.push(score.checkpoints[checkpointIndex])
        }

        const result = Array.from(teamnames, (_, i) => [teamnames[i], checkpoints[i]])
        return result
    } catch (error) {
        throw error
    }
}

/**
 * Gets the average score and best score for the chosen round
 * @param roundId the selected round
 * @returns the average score and best score
 */
export async function getGhostTrainScores(roundId: number) {
    try {
        const client = new MongoClient(process.env.MONGO_URL as string)
        await client.connect()

        const db = client.db()
        const scores = db.collection("scores")
        const roundIdStr: string = roundId.toString()

        const bestScore = await scores
            .aggregate([
                {
                    $match: { roundId: roundIdStr },
                },
                {
                    $group: {
                        _id: null,
                        maxScore: { $max: "$score" },
                        teamName: { $first: "$teamname" },
                    },
                },
            ])
            .toArray()

        const avgScore = await scores
            .aggregate([
                {
                    $match: { roundId: roundIdStr },
                },
                {
                    $group: {
                        _id: null,
                        averageScore: { $avg: "$score" },
                    },
                },
            ])
            .toArray()

        return { avgScore, bestScore }
    } catch (error) {
        console.log(error)
    }
}
