import type { Request, Response } from "express"
import { Router } from "express"
import { getTopicsByStudy } from "./roundDBController"

export const lobbyRouter = Router()

// The `lobbies` Map stores the lobby IDs as keys, and a boolean as the value.
// The boolean indicates wether a game is still open, true = people can join and false = game has started.
const lobbies: Map<number, boolean> = new Map()

/**
 * Get function for creating a new lobby
 * Returns a unique LobbyID
 *
 * Example usage: http://localhost:5000/api/lobby/create
 */
lobbyRouter.get("/create", (req: Request, res: Response) => {
    //Create ID for new lobby
    let isValid = false
    let lobbyId = 0
    while (!isValid) {
        //Keep generating new IDs until a valid one is found
        lobbyId = 1000 + Math.ceil(Math.random() * 8999) //Lobby ID should be between 1 and 9999
        if (lobbies.get(lobbyId) === undefined) {
            isValid = true
        }
    }
    lobbies.set(lobbyId, isValid)
    res.status(200).send([lobbyId])
})

/**
 * Get function for acquiring a round for a certain topic
 * Returns an array of strings
 *
 * Example usage: http://localhost:5000/api/lobby/getRounds/XXX
 */
lobbyRouter.get("/getRounds/:study", async (req: Request, res: Response) => {
    const study: string = req.params.study

    let result: string[] = []
    try {
        result = await getTopicsByStudy(study)
    } catch (error) {
        res.status(400).send("This study has no rounds")
        return
    }
    res.status(200).send(result)
})

/**
 * Get function to validate given lobby ID
 * Requires the lobby ID in the path
 * Checks `lobbies` for given ID
 * Returns `true` if the given ID is valid, otherwise `false`
 *
 * Example usage: http://localhost:5000/api/lobby/validate/1234
 */
lobbyRouter.get("/validate/:lobbyid", (req: Request, res: Response) => {
    //Given lobby ID is initially a `string`, we use the unary operator `+` to convert it to a `number`
    const givenId: number = +req.params.lobbyid
    const joinable: boolean | undefined = lobbies.get(givenId)
    if (joinable == undefined) {
        res.status(200).send(false)
    }
    res.status(200).send(joinable)
})

/**
 * This function makes the lobby no longer joinable
 * @param lobbyId the id of the lobby
 */
export function makeLobbyNotJoinable(lobbyId: number) {
    lobbies.set(lobbyId, false)
}

export function endLobby(lobbyId: number) {
    lobbies.delete(lobbyId)
}
