import type { IRound } from "../models/roundModel"
import { Game } from "../objects/gameObject"
import { User } from "../objects/userObject"

import type { Request, Response } from "express"
import { Router } from "express"

//number as key did not work for some reason
export const games: Map<string, Game> = new Map()

export const gameRouter = Router()

/**
 * Creates a game object and adds it to the map of games
 * @param rounds the selected rounds
 * @param teamName the name of the team
 * @param socketIds the socketIds of the players that are in the game
 * @param lobbyId the id of the lobby
 */
export function addGame(
    rounds: IRound[],
    roundDurations: number[],
    teamName: string,
    socketIds: string[],
    lobbyId: number,
    study: string
) {
    const map: Map<string, User> = new Map()
    for (const socketId of socketIds) map.set(socketId, new User())
    const game: Game = new Game(rounds, roundDurations, teamName, map, study)
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
 * Ends a round by reseting all the values for the game.
 * @param lobbyId the id of the game
 * @returns true if this game contains another round, false if this was the last round
 */
export function endRound(lobbyId: number): boolean {
    const game = games.get(`${lobbyId}`)
    if (game === undefined) throw Error("No such game")

    game.avgScore = 0
    game.totalScore = 0
    game.round += 1
    const users = Array.from(game.users.values())
    for (const user of users) {
        user.resetUser()
    }
    game.checkpoints = []
    game.timeScores = []
    game.correct = 0
    game.incorrect = 0
    return game.round < game.rounds.length
}

/**
 * Gets the duration of the current round, as was set by the lecturer at the start
 * @param lobbyId the id of the game
 * @returns the duration of the round
 */
export function getRoundDuration(lobbyId: number): number {
    const game = games.get(`${lobbyId}`)
    if (game === undefined) throw Error("No such game")

    return game.roundDurations[game.round]
}

export function clearGames(): void {
    games.clear()
}
