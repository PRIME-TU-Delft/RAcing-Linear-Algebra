import { ObjectId } from "mongodb"
import { Score } from "../models/scoreModel"
import type { IScore, University } from "../models/scoreModel"

const { MongoClient } = require("mongodb")
const sample = require( '@stdlib/random-sample' );
const shuffle = require( '@stdlib/random-shuffle' );

/**
 * Builds the filter that decides which previously played teams a game is compared against.
 * TU Delft games only see TU Delft scores (including legacy scores without a university),
 * external games see every score.
 * @param university the university of the game requesting the scores
 * @returns a mongo filter to merge into a score query
 */
function scorePoolFilter(university: University) {
    // Matching null also matches documents where the field is missing
    return university === "tudelft" ? { university: { $in: ["tudelft", null] } } : {}
}

export interface DefaultTeamsData {
    fakeTeamsCount: number
    totalTeamsCount: number
    topicId: string
}

export async function saveNewScore(
    teamname: string,
    scores: number[],
    checkpoints: number[],
    topicId: string,
    roundDuration: number,
    study: string,
    accuracy: number,
    university: University,
    isFakeTeam?: boolean
) {
    const newScore: IScore = new Score({
        teamname,
        scores,
        checkpoints,
        topicId,
        roundDuration,
        study,
        accuracy,
        university,
        isFakeTeam: isFakeTeam != null ? isFakeTeam : false,
    })
    if (scores === null || scores.length === 0) return    
    await Score.create(newScore)
}

export async function getAllScores(topicId: string, university: University): Promise<IScore[]> {
    try {
        const result: IScore[] = await Score.find({ topicId: new ObjectId(topicId), ...scorePoolFilter(university) })
        return result
    } catch (error) {
        throw error
    }
}

export async function getAllDefaultTeams(): Promise<DefaultTeamsData[]> {
    try {
      const teams = await Score.aggregate([
        { 
          $group: {
            _id: "$topicId",
            totalTeams: { $sum: 1 },
            fakeTeams: { $sum: { $cond: [ "$isFakeTeam", 1, 0 ] } }
          }
        }
      ])
      return teams.map(team => ({
        topicId: team._id.toString(),
        totalTeamsCount: team.totalTeams,
        fakeTeamsCount: team.fakeTeams
      }))
    } catch (error) {
      throw error
    }
}

export async function deleteDefaultTeamsForTopic(topicId: string) {
    try {
        const result = await Score.deleteMany({ topicId: new ObjectId(topicId), isFakeTeam: true })
        return result
    } catch (error) {
        throw error
    }
}

/**
 * This function gets all the checkpoint for a certain round at a certain checkpoint
 * @param topicId the id of the round that is being played
 * @param checkpointIndex the index of the checkpoint we want
 * @param university the university of the game, determines which teams are compared against
 * @returns all the times at the current checkpoint
 */
export async function getCheckpoints(
    topicId: string,
    checkpointIndex: number,
    university: University
): Promise<(string | number)[][]> {
    try {
        const IScores: IScore[] = await Score.find({ topicId: new ObjectId(topicId), ...scorePoolFilter(university) })
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
async function getBestTeams(topicId: string, numberOfTeams: number, university: University) {
    try {
        const client = new MongoClient(process.env.MONGO_URL as string)
        await client.connect()

        const db = client.db()
        const scores = db.collection("scores")

        const bestTeams = await scores.aggregate([
            {
                $match: { topicId: new ObjectId(topicId), ...scorePoolFilter(university) },
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
 * @param university the university of the game, determines which teams are binned
 * @returns equally sized bins based on team scores
 */
async function getBinsOfTeams(topicId: string, numberOfBins: number, university: University, excludeTeamIds?: ObjectId[]) {
    try {
        const client = new MongoClient(process.env.MONGO_URL as string)
            await client.connect()

            const db = client.db()
            const scores = db.collection("scores")

        const res = await scores.aggregate([
            {
            $match: {
                topicId: new ObjectId(topicId),
                _id: { $nin: excludeTeamIds ? excludeTeamIds : [] },
                ...scorePoolFilter(university)
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
 * @param university the university of the game, determines which teams can be ghosts
 * @returns ghost teams for current round
 */
export async function getGhostTeams(topicId: string, university: University) {
    const totalTeams = await Score.countDocuments({ topicId: new ObjectId(topicId), ...scorePoolFilter(university) })
    if (totalTeams === 0) return []

    const numberOfTopTeamsToGet = Math.min(3, totalTeams)
    const numberOfBins = Math.min(5, totalTeams)

    const topicIdStr = topicId.toString()
    const bestTeams = await getBestTeams(topicIdStr, numberOfTopTeamsToGet, university)
    const bestTeamIds = bestTeams.map(x => x._id)

    let ghostTeams = bestTeams
    const teamBins = await getBinsOfTeams(topicIdStr, numberOfBins, university, bestTeamIds)
    
    for (const bin of teamBins) {
      const sampleSize = Math.min(3, bin.documents.length)
      if (sampleSize > 0) {
        const sampledTeams = sample(bin.documents, { size: sampleSize, replace: false })
        ghostTeams = ghostTeams.concat(sampledTeams)
      }
    }
    return shuffle(ghostTeams)
  }

/**
 * Retrieves the final score of the best performing team for a given round
 * @param topicId id of the current round
 * @param university the university of the game, determines which teams are considered
 * @returns the normalized final score of the best team
 */
export async function getBestTeamFinalScore(topicId: string, university: University) {
    const topicIdStr: string = topicId.toString()
    const bestTeams = await getBestTeams(topicIdStr, 1, university)
    if (bestTeams[0] == null || bestTeams[0].lastElement === undefined) {
        return 1
      }
    const bestTeam = bestTeams[0]
    return bestTeam.lastElement
}

/**
 * Gets the average score and best score for the chosen round
 * @param topicId the selected round
 * @param university the university of the game, determines which teams are considered
 * @returns the average score and best score
 */
export async function getGhostTrainScores(topicId: string, university: University) {
    try {
        const client = new MongoClient(process.env.MONGO_URL as string)
        await client.connect()

        const db = client.db()
        const scores = db.collection("scores")
        const topicIdStr: string = topicId.toString()

        const bestScore = await scores
            .aggregate([
                {
                    $match: { topicId: new ObjectId(topicId), ...scorePoolFilter(university) },
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
                    $match: { topicId: new ObjectId(topicId), ...scorePoolFilter(university) },
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

export async function saveMultipleScores(scoresArray: IScore[]) {
    try {
        console.log("Saving multiple scores to the database")
        console.log(scoresArray)
      await Score.insertMany(scoresArray)
    }
    catch (error) {
      throw error
    }
  }