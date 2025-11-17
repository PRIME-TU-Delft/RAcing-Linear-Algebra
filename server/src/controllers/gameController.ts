import type { IRound } from "../models/roundModel"
import { Game } from "../objects/gameObject"
import { User } from "../objects/userObject"

import type { Request, Response } from "express"
import { Router } from "express"
import { ITopicWithPopulatedVariants } from "./topicVariantsDBController"

//number as key did not work for some reason
export const games: Map<string, Game> = new Map()

export const gameRouter = Router()

/**
 * Creates a game object and adds it to the map of games
 * @param topics the selected topics
 * @param teamName the name of the team
 * @param socketIds the socketIds of the players that are in the game
 * @param lobbyId the id of the lobby
 */
export function addGame(
    topics: ITopicWithPopulatedVariants[],
    roundDurations: number[],
    teamName: string,
    userIds: string[],
    lobbyId: number,
    study: string,
    allowIndividualPlacements?: boolean
) {
    const map: Map<string, User> = new Map()
    for (const userId of userIds) map.set(userId, new User())
    const game: Game = new Game(topics, roundDurations, teamName, map, study,  allowIndividualPlacements ?? false)
    games.set(`${lobbyId}`, game)
}

/**
 * Removes a game from the list of games
 * @param lobbyId the id of the game
 */
export function removeGame(lobbyId: number) {
    games.delete(`${lobbyId}`)
}

/**
 * Get a game by its lobbyId
 * @param lobbyId the id of the game
 * @returns the game object
 */
export function getGame(lobbyId: number): Game {
    const game = games.get(`${lobbyId}`)
    if (game === undefined) throw Error("No such game")
    return game
}

/**
 * Determine whether a game with a given id is in progress
 * @param lobbyId the id of the game
 * @returns whether there is such a game currently in progress
 */
export function gameIsInProgress(lobbyId: number): boolean {
    return games.has(`${lobbyId}`)
}

/**
 * Ends a round by reseting all the values for the game.
 * @param lobbyId the id of the game
 * @returns true if this game contains another round, false if this was the last round
 */
export function endRound(lobbyId: number): boolean {
    const game = games.get(`${lobbyId}`)
    if (game === undefined) throw Error("No such game")

    game.avgScore = 0
    game.totalScore = 0
    game.currentTopicIndex += 1
    const users = Array.from(game.users.values())
    for (const user of users) {
        user.resetUser()
    }
    game.checkpoints = []
    game.timeScores = []
    game.correct = 0
    game.incorrect = 0
    return game.currentTopicIndex < game.topics.length
}

/**
 * Gets the duration of the current round, as was set by the lecturer at the start
 * @param lobbyId the id of the game
 * @returns the duration of the round
 */
export function getRoundDuration(lobbyId: number): number {
    const game = games.get(`${lobbyId}`)
    if (game === undefined) throw Error("No such game")

    return game.roundDurations[game.currentTopicIndex]
}

export function clearGames(): void {
    games.clear()
}
