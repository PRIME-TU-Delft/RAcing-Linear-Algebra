import { ObjectId } from "mongodb"
import { Score } from "../models/scoreModel"
import type { IScore } from "../models/scoreModel"

const { MongoClient } = require("mongodb")
const sample = require( '@stdlib/random-sample' );
const shuffle = require( '@stdlib/random-shuffle' );

export async function saveNewScore(
    teamname: string,
    scores: number[],
    checkpoints: number[],
    topicId: string,
    roundDuration: number,
    study: string,
    accuracy: number
) {
    const newScore: IScore = new Score({
        teamname,
        scores,
        checkpoints,
        topicId,
        roundDuration,
        study,
        accuracy,
    })
    if (scores === null || scores.length === 0) return    
    await Score.create(newScore)
}

export async function getAllScores(topicId: string): Promise<IScore[]> {
    try {
        const result: IScore[] = await Score.find({ topicId: new ObjectId(topicId) })
        return result
    } catch (error) {
        throw error
    }
}

/**
 * This function gets all the checkpoint for a certain round at a certain checkpoint
 * @param topicId the id of the round that is being played
 * @param checkpointIndex the index of the checkpoint we want
 * @returns all the times at the current checkpoint
 */
export async function getCheckpoints(
    topicId: string,
    checkpointIndex: number
): Promise<(string | number)[][]> {
    try {
        const IScores: IScore[] = await Score.find({ topicId: new ObjectId(topicId) })
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
 * @param topicId the selected round
 * @returns the average score and best score
 */
async function getBestTeams(topicId: string, numberOfTeams: number) {
    try {
        const client = new MongoClient(process.env.MONGO_URL as string)
        await client.connect()

        const db = client.db()
        const scores = db.collection("scores")

        const bestTeams = await scores.aggregate([
            {
                $match: { topicId: new ObjectId(topicId) },
            },
            {
              $addFields: {
                lastElement: { $arrayElemAt: ["$scores", -1] } // Extract the last element of the array
              }
            },
            {
              $sort: {
                lastElement: -1 // Sort based on the last element in descending order
              }
            },
            {
              $limit: numberOfTeams // Get the top 'numberOfTeams' teams
            }
          ]).toArray()

        return bestTeams
    } catch (error) {
        console.log(error)
    }
}

/**
 * Creates equally sized bins depending on the team score over the teams that played the round
 * @param topicId the id of the current round
 * @param numberOfBins number of bins to create
 * @param excludeTeamIds ids of teams to exclude from the bins
 * @returns equally sized bins based on team scores
 */
async function getBinsOfTeams(topicId: string, numberOfBins: number, excludeTeamIds?: ObjectId[]) {
    try {
        const client = new MongoClient(process.env.MONGO_URL as string)
            await client.connect()

            const db = client.db()
            const scores = db.collection("scores")

        const res = await scores.aggregate([
            {
            $match: {
                topicId: new ObjectId(topicId),
                _id: { $nin: excludeTeamIds ? excludeTeamIds : [] }
            }
            },
            {
            $addFields: {
                lastElement: { $arrayElemAt: ["$scores", -1] } // Get the last element from the scores array
            }
            },
            {
            $bucketAuto: {
                groupBy: "$lastElement",
                buckets: numberOfBins, // Create 5 buckets
                output: {
                documents: { $push: "$$ROOT" } // Store the entire documents in each bucket
                }
            }
            }
        ]).toArray()

        return res
    } catch(error) {
        console.log(error)
    }
}

/**
 * Get ghost teams for current round, by taking the top 3 teams and binning + sampling the rest
 * @param topicId id of the current round
 * @returns ghost teams for current round
 */
export async function getGhostTeams(topicId: string) {
    const config = {
        numberOfTopTeamsToGet: 3, // Currently we take top 3 teams fixed
        numberOfTeamsToRandomlySample: 15, // We randomly sample for 15 additional teams (with binning)
        numberOfBins: 5 // Number of bins to create before sampling
    }
    const topicIdStr: string = topicId.toString()

    const bestTeams = await getBestTeams(topicIdStr, config.numberOfTopTeamsToGet)
    const bestTeamIds = bestTeams.map(x => x._id)
    let ghostTeams = bestTeams

    const teamBins = await getBinsOfTeams(topicIdStr, config.numberOfBins, bestTeamIds)

    for (const bin of teamBins) {
        const sampledTeams = sample(bin.documents, {size: 3, replace: false})
        ghostTeams = ghostTeams.concat(sampledTeams)
    }

    return shuffle(ghostTeams)
}

/**
 * Retrieves the final score of the best performing team for a given round
 * @param topicId id of the current round
 * @returns the normalized final score of the best team
 */
export async function getBestTeamFinalScore(topicId: string) {
    const topicIdStr: string = topicId.toString()
    const bestTeams = await getBestTeams(topicIdStr, 1)
    const bestTeam = bestTeams[0]
    return bestTeam.lastElement
}

/**
 * Gets the average score and best score for the chosen round
 * @param topicId the selected round
 * @returns the average score and best score
 */
export async function getGhostTrainScores(topicId: string) {
    try {
        const client = new MongoClient(process.env.MONGO_URL as string)
        await client.connect()

        const db = client.db()
        const scores = db.collection("scores")
        const topicIdStr: string = topicId.toString()

        const bestScore = await scores
            .aggregate([
                {
                    $match: { topicId: new ObjectId(topicId) },
                },
                {
                    $group: {
                        _id: null,
                        maxScore: { $max: { $last: "$score"} },
                        teamName: { $first: "$teamname" },
                    },
                },
            ])
            .toArray()

        const avgScore = await scores
            .aggregate([
                {
                    $match: { topicId: new ObjectId(topicId)},
                },
                {
                    $group: {
                        _id: null,
                        averageScore: { $avg: { $last: "$score"} },
                    },
                },
            ])
            .toArray()

        return { avgScore, bestScore }
    } catch (error) {
        console.log(error)
    }
}
