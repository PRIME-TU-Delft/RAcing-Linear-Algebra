import type { ObjectId } from "mongodb"
import { Score } from "../models/scoreModel"
import type { IScore } from "../models/scoreModel"

const { MongoClient } = require("mongodb")
const sample = require( '@stdlib/random-sample' );
const shuffle = require( '@stdlib/random-shuffle' );

export async function saveNewScore(
    teamname: string,
    scores: number[],
    checkpoints: number[],
    roundId: string,
    roundDuration: number,
    study: string,
    accuracy: number
) {
    const newScore: IScore = new Score({
        teamname,
        scores,
        checkpoints,
        roundId,
        roundDuration,
        study,
        accuracy,
    })
    if (score === null || score.length === 0) return    
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
async function getBestTeams(roundId: string, numberOfTeams: number) {
    try {
        const client = new MongoClient(process.env.MONGO_URL as string)
        await client.connect()

        const db = client.db()
        const scores = db.collection("scores")

        const bestTeams = await scores.aggregate([
            {
                $match: { roundId: roundId },
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
 * @param roundId the id of the current round
 * @param numberOfBins number of bins to create
 * @param excludeTeamIds ids of teams to exclude from the bins
 * @returns equally sized bins based on team scores
 */
async function getBinsOfTeams(roundId: string, numberOfBins: number, excludeTeamIds?: ObjectId[]) {
    try {
        const client = new MongoClient(process.env.MONGO_URL as string)
            await client.connect()

            const db = client.db()
            const scores = db.collection("scores")

        const res = await scores.aggregate([
            {
            $match: {
                roundId: roundId,
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
 * @param roundId id of the current round
 * @returns ghost teams for current round
 */
export async function getGhostTeams(roundId: number) {
    const config = {
        numberOfTopTeamsToGet: 3, // Currently we take top 3 teams fixed
        numberOfTeamsToRandomlySample: 15, // We randomly sample for 15 additional teams (with binning)
        numberOfBins: 5 // Number of bins to create before sampling
    }
    const roundIdStr: string = roundId.toString()

    const bestTeams = await getBestTeams(roundIdStr, config.numberOfTopTeamsToGet)
    const bestTeamIds = bestTeams.map(x => x._id)
    let ghostTeams = bestTeams

    const teamBins = await getBinsOfTeams(roundIdStr, config.numberOfBins, bestTeamIds)

    for (const bin of teamBins) {
        const sampledTeams = sample(bin.documents, {size: 3, replace: false})
        ghostTeams = ghostTeams.concat(sampledTeams)
    }

    return shuffle(ghostTeams)
}

/**
 * Retrieves the final score of the best performing team for a given round
 * @param roundId id of the current round
 * @returns the normalized final score of the best team
 */
export async function getBestTeamFinalScore(roundId: number) {
    const roundIdStr: string = roundId.toString()
    const bestTeams = await getBestTeams(roundIdStr, 1)
    const bestTeam = bestTeams[0]

    return bestTeam.lastElement
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
                        maxScore: { $max: { $last: "$score"} },
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
