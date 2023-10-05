import { Round } from "../models/roundModel"
import type { IRound } from "../models/roundModel"

import { Questions } from "../models/questionModel"
import type { IQuestion } from "../models/questionModel"
import type { Router } from "express"

export const router: Router = require("express").Router()
/**
 * Fetches a round from the database given a topic and returns the questions for that round.
 * @param topic The subject of the round to be retrieved
 * @returns All the questions for the given round, the mandatory questions are always first in the array
 * followed by the bonus questions.
 */
export async function getRoundQuestions(topic: string): Promise<IQuestion[] | undefined> {
    Questions // For some reason this line is needed for the populate to work, don't remove
    const round = await Round.findOne({ subject: topic })
        .populate("bonus_questions")
        .populate("mandatory_questions")
    if (!round) throw new Error(`Round with subject ${topic} not found`)

    let questions: IQuestion[] | undefined = round?.mandatory_questions
    questions = questions?.concat(round?.bonus_questions ?? [])

    return questions
}

/**
 * Gets all the topics that are available for a single study
 * @param studying the study to search for topics
 * @returns the topics
 */
export async function getTopicsByStudy(studying: string): Promise<string[]> {
    Questions // For some reason this line is needed for the populate to work, don't remove
    const rounds = await Round.find({ study: { $in: [studying] } })
    if (rounds === undefined || rounds.length == 0) throw new Error(`No topics found ${studying}`)
    const topics: string[] = []
    for (const round of rounds) {
        const topic: string | undefined = round?.subject
        if (topic !== undefined) topics.push(round?.subject)
    }
    if (topics.length == 0) throw new Error(`These rounds dont have a subject`)

    return topics
}

/**
 * Gets the selected rounds from the database by searching for the study and selected topics
 * @param studying the select study (Abbreviated and in capital e.g. CSE)
 * @param topics the selected topics of rounds
 * @returns the requested rounds
 */
export async function getIRounds(studying: string, topics: string[]): Promise<IRound[]> {
    Questions // For some reason this line is needed for the populate to work, don't remove
    const rounds = await Round.find({ study: { $in: [studying] } })
        .populate("bonus_questions")
        .populate("mandatory_questions")
    if (rounds.length == 0) throw new Error(`There are no topics for ${studying}`)
    const res: IRound[] = []
    for (const topic of topics) {
        const round = rounds.find((x) => x.subject === topic)
        if (round !== undefined) res.push(round)
    }
    return res
}
