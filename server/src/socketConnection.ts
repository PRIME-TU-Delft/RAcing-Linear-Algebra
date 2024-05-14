import type { Socket } from "socket.io"
import { addGame, getGame, endRound, getRoundDuration } from "./controllers/gameController"
import { getIRounds } from "./controllers/roundDBController"
import { startLobby } from "./controllers/lobbyController"
import {
    saveNewScore,
    getAllScores,
    getCheckpoints,
    getGhostTrainScores,
    getGhostTeams,
    getBestTeamFinalScore,
} from "./controllers/scoreDBController"
import type { Game } from "./objects/gameObject"
import { Statistic } from "./objects/statisticObject"

const socketToLobbyId = new Map<string, number>()
const themes = new Map<number, string>()

module.exports = {
    getIo: (server) => {
        const io = require("socket.io")(server, {
            cors: {
                origin: "*",
            },
            connectionStateRecovery: {
                // the backup duration of the sessions and the packets
                maxDisconnectionDuration: 2 * 60 * 1000,
                // whether to skip middlewares upon successful recovery
                skipMiddlewares: true,
              }
        })

        io.on("connection", (socket: Socket) => {
            console.log("DATA")
            console.log(socket.data)
            console.log("CONNECTED")
            console.log(socket.id)
            console.log(socket.rooms)

            if (socket.recovered) {
                console.log("RECOVERED SUCCESFULLY!")
                const lobbyId = socketToLobbyId.get(socket.id)!
                try {
                    const game = getGame(lobbyId)
                    game.users.set(socket.id, socket.data.lastRecordedUserData)

                    game.totalScore += socket.data.lastRecordedUserData.score

                    game.avgScore = game.totalScore / game.users.size

                    const accuracy = (game.correct / (game.incorrect + game.correct)) * 100
                    const numberOfPlayers: number = io.sockets.adapter.rooms.get(`players${lobbyId}`).size

                    io.to(`lecturer${lobbyId}`).emit("score", {
                        score: Math.floor(game.totalScore),
                        accuracy: Math.floor(accuracy),
                        averageTeamScore: Math.floor(game.totalScore / numberOfPlayers)
                    })
                    io.to(`players${lobbyId}`).emit("score", {
                        score: Math.floor(game.totalScore),
                        accuracy: Math.floor(accuracy),
                        averageTeamScore: Math.floor(game.totalScore / numberOfPlayers)
                    })

                } catch (error) {
                    //If an error is throw it means the game was not started yet
                    //So we only have to send the updated amount of players in the lobby
                    const players: number = io.sockets.adapter.rooms.get(
                        `players${lobbyId}`
                    ).size
                    io.to(`lecturer${lobbyId}`).emit("new-player-joined", players)
                }
            }
            /**
             * Create a lobby with the lobbyId
             */
            socket.on("createLobby", (lobbyId: number) => {
                socketToLobbyId.set(socket.id, lobbyId) //Add the lecturer socketID to the map of socketIDs to lobbyIDs
                void socket.join(`lecturer${lobbyId}`)
            })

            /**
             * Join a lobby by lobbyId
             */
            socket.on("joinLobby", (lobbyId: number) => {
                void socket.join(`players${lobbyId}`)
                socketToLobbyId.set(socket.id, lobbyId)
                const players: number = io.sockets.adapter.rooms.get(`players${lobbyId}`).size
                io.to(`lecturer${lobbyId}`).emit("new-player-joined", players)
            })

            /**
             * Leave a lobby by lobbyId (e.g. quitting at waiting screen)
             */
            socket.on("leaveLobby", (lobbyId: number) => {
                void socket.leave(`players${lobbyId}`)
                try {
                    const players: number = io.sockets.adapter.rooms.get(`players${lobbyId}`).size
                    io.to(`lecturer${lobbyId}`).emit("new-player-joined", players)
                } catch (error) {
                    // If an error is caught, it means there are no longer any players in the lobby, 
                    // thus emit so to the lecturer 0
                    io.to(`lecturer${lobbyId}`).emit("new-player-joined", 0)
                }
            })

            /**
             * After a socket disconnects, update the amount of players in the lobby/game
             * And also update the score if they were in a game
             */
            socket.on("disconnect", () => {
                console.log("DISCONNECT:")
                console.log(socket.id)
                console.log(socket.rooms)
                const lobbyId = socketToLobbyId.get(socket.id)!
                try {
                    const game = getGame(lobbyId)
                    const user = game.users.get(socket.id)
                    if (user === undefined) return

                    game.totalScore -= user.score
                    socket.data.lastRecordedUserData = user

                    game.users.delete(socket.id)
                    game.avgScore = game.totalScore / game.users.size

                    const accuracy = (game.correct / (game.incorrect + game.correct)) * 100
                    const numberOfPlayers: number = io.sockets.adapter.rooms.get(`players${lobbyId}`).size

                    io.to(`lecturer${lobbyId}`).emit("score", {
                        score: Math.floor(game.totalScore),
                        accuracy: Math.floor(accuracy),
                        averageTeamScore: Math.floor(game.totalScore / numberOfPlayers)
                    })
                    io.to(`players${lobbyId}`).emit("score", {
                        score: Math.floor(game.totalScore),
                        accuracy: Math.floor(accuracy),
                        averageTeamScore: Math.floor(game.totalScore / numberOfPlayers)
                    })
                } catch (error) {
                    console.log(error)
                    //If an error is throw it means the game was not started yet
                    //So we only have to send the updated amount of players in the lobby
                    if (io.sockets.adapter.rooms.get(`players${lobbyId}`) === undefined)
                        io.to(`lecturer${lobbyId}`).emit("new-player-joined", 0)
                    else {
                        const players: number = io.sockets.adapter.rooms.get(
                            `players${lobbyId}`
                        ).size
                        io.to(`lecturer${lobbyId}`).emit("new-player-joined", players)
                    }
                }
            })

            /**
             * Starts the game and sends a round started message to all players in the lobby
             * Function gets all the selected rounds and creates a game object with all the information to store
             */
            socket.on(
                "startGame",
                async (lobbyId: number, topics: string[], roundDurations: number[], study: string, teamName: string) => {
                    startLobby(lobbyId)
                    try {
                        const rounds = await getIRounds(study, topics)
                        if (io.sockets.adapter.rooms.get(`players${lobbyId}`).size == 0) return
                        const socketIds: string[] = io.sockets.adapter.rooms.get(
                            `players${lobbyId}`
                        )
                        addGame(rounds, roundDurations, teamName, socketIds, lobbyId, study)
                        const roundDuration = getRoundDuration(lobbyId)
                        io.to(`lecturer${lobbyId}`).emit("round-duration", roundDuration)
                        io.to(`players${lobbyId}`).emit("round-started", roundDuration)
                    } catch (error) {
                        console.error(error)
                    }

                    try {
                        const lobbyId = socketToLobbyId.get(socket.id)!
    
                        const game = getGame(lobbyId)
                        const round = game.rounds[game.round]
                        const roundId: number = round.id
    
                        const ghostTrainScores = await getGhostTrainScores(roundId)
    
                        socket.emit("ghost-trains", ghostTrainScores)
                    } catch (error) {
                        console.log(error)
                    }
                }
            )

            /**
             * Gets a new question for a user, if a difficulty is specified one gets selected with that difficulty
             * If they do not give a difficulty they get the next mandatory one
             */
            socket.on("getNewQuestion", async (difficulty?: string) => {
                const lobbyId = socketToLobbyId.get(socket.id)!
                try {
                    const game = getGame(lobbyId)
                    const question = await game.getNewQuestion(socket.id, difficulty)
                    socket.emit("get-next-question", question)
                    console.log(question?.answer)
                } catch (error) {
                    console.error(error)
                }
            })

            /**
             * Checks the answer a user gave
             * If they answered incorrect while having attempts left, they can try again
             * If they have no more mandatory questions left, they get the choose difficulty screen
             * If they answered correctly the new score gets sent to the lecturer
             */
            socket.on("checkAnswer", (answer: string) => {
                const lobbyId = socketToLobbyId.get(socket.id)!
                try {
                    console.log(`Given answer: ${answer}`)
                    const game = getGame(lobbyId)
                    const [correctAnswer, score] = game.checkAnswer(socket.id, answer)
                    const attempts = game.attemptChecker(socket.id)
                    if (correctAnswer) {
                        socket.emit("rightAnswer", score)
                        if (game.isMandatoryDone(socket.id)) socket.emit("chooseDifficulty")
                        const accuracy = (game.correct / (game.incorrect + game.correct)) * 100
                        const numberOfPlayers: number = io.sockets.adapter.rooms.get(`players${lobbyId}`).size
                        
                        io.to(`lecturer${lobbyId}`).emit("score", {
                            score: Math.floor(game.totalScore),
                            accuracy: Math.floor(accuracy),
                            averageTeamScore: Math.floor(game.totalScore / numberOfPlayers)
                        })
                        io.to(`players${lobbyId}`).emit("score", {
                            score: Math.floor(game.totalScore),
                            accuracy: Math.floor(accuracy),
                            averageTeamScore: Math.floor(game.totalScore / numberOfPlayers)
                        })
                    } else if (attempts === 0) {
                        socket.emit("wrongAnswer", 0)
                        if (game.isMandatoryDone(socket.id)) socket.emit("chooseDifficulty")
                    } else {
                        socket.emit("wrongAnswer", attempts)
                    }
                } catch (error) {
                    console.error(error)
                }
            })

            /**
             * Adds a checkpoint to the gameobject
             * Also sends back all the scores of other teams at that checkpoint
             */
            socket.on("addCheckpoint", async (seconds: number) => {
                const lobbyId = socketToLobbyId.get(socket.id)!

                try {
                    const game = getGame(lobbyId)
                    game.addCheckpoint(seconds)

                    const round = game.rounds[game.round]
                    const result = await getCheckpoints(round.id, game.checkpoints.length - 1)
                    socket.emit("get-checkpoints", result)
                } catch (error) {
                    console.error(error)
                }
            })

            /**
             * At the end of a round we save all the data to the database
             * Then we retrieve the information of all other teams who played this round and send that back
             */
            socket.on("endRound", async () => {
                const lobbyId = socketToLobbyId.get(socket.id)
                if (lobbyId == undefined) return
                
                
                io.to(`players${lobbyId}`).emit("round-ended")
                const game: Game = getGame(lobbyId)

                const accuracy: number = Math.floor(
                    (game.correct / (game.incorrect + game.correct)) * 100
                )

                if (game.totalScore !== 0) {
                    await saveNewScore(
                        game.teamName,
                        game.timeScores,
                        game.checkpoints,
                        game.rounds[game.round]._id,
                        game.roundDurations[game.round],
                        game.study,
                        accuracy
                    )
                    const currentRound = game.rounds[game.round]
    
                    const result = await getAllScores(currentRound.id)
                    socket.emit("get-all-scores", result)
                }
            })

            /**
             * This function saves a new time score when called by frontend
             * The time score is taken from the current team score after applying normalization
             */
            socket.on("saveTimeScore", () => {
                const lobbyId = socketToLobbyId.get(socket.id)!
                const game = getGame(lobbyId)
                game.addNewTimeScore()
            })

            /**
             * Gets randomly sampled ghost teams, applies interpolation and sends them to client
             */
            socket.on("getGhostTeams", async () => {
                try {
                    const lobbyId = socketToLobbyId.get(socket.id)!

                    const game = getGame(lobbyId)
                    const round = game.rounds[game.round]
                    const roundId: number = round.id

                    const ghostTeams = await getGhostTeams(roundId)
                    const interpolatedGhostTeams = ghostTeams.map(x => ({
                        teamName: x.teamname,
                        timeScores: game.getGhostTeamTimePointScores(x.scores),
                        checkpoints: x.checkpoints,
                        study: x.study,
                        accuracy: x.accuracy
                    }))
                    io.to(`players${lobbyId}`).emit("ghost-teams", interpolatedGhostTeams)
                    io.to(`lecturer${lobbyId}`).emit("ghost-teams", interpolatedGhostTeams)
                } catch (error) {
                    console.log(error)
                }
            })

            /**
             * Calculate the end point of one race lap for the current round
             * Currently set to half of the best team's final score
             */
            socket.on("getRaceTrackEndScore", async () => {
                try {
                    const lobbyId = socketToLobbyId.get(socket.id)!
                    const game = getGame(lobbyId)
                    const round = game.rounds[game.round]
                    const roundId: number = round.id

                    const normalizedHighestFinalScore = await getBestTeamFinalScore(roundId)
                    const halvedHighestFinalScore = Math.floor(
                        normalizedHighestFinalScore 
                        * game.roundDurations[game.round] 
                        * game.users.size 
                        / 3)

                    io.to(`players${lobbyId}`).emit("race-track-end-score", halvedHighestFinalScore)
                    io.to(`lecturer${lobbyId}`).emit("race-track-end-score", halvedHighestFinalScore)
                } catch (error) {
                    console.log(error)
                }
            })
        
            /**
             * This function gets the statistics for the lecturer
             * This includes all the questions answered with the score, accuracy, difficuly and answer
             */
            socket.on("getLecturerStatistics", () => {
                const lobbyId = socketToLobbyId.get(socket.id)!
                const game = getGame(lobbyId)
                const stats = game.calculateStatistics()

                socket.emit("statistics", JSON.stringify(stats))

                //If this was the last round display end game button for lecturer
                //And let the users go back to homescreen whenever they want
                if (game.round + 1 >= game.rounds.length) {
                    io.to(`players${lobbyId}`).emit("game-ended")
                    socket.emit("game-ended")
                }
            })

            /**
             * Once the lecturer screen countdown is complete, start the game for all players regardless of their individual countdowns
             */
            socket.on("beginRace", () => {
                const lobbyId = socketToLobbyId.get(socket.id)!
                io.to(`players${lobbyId}`).emit("race-started")
            })

            /**
             * Starts the next round by resetting all the values for the game and sending round-started to all players
             */
            socket.on("startNextRound", () => {
                const lobbyId = socketToLobbyId.get(socket.id)!

                //Reset the round to prepare for the next
                const continueGame = endRound(lobbyId)

                if (!continueGame) io.to(`players${lobbyId}`).emit("end-game")
                else {
                    const roundDuration = getRoundDuration(lobbyId)
                    io.to(`lecturer${lobbyId}`).emit("round-duration", roundDuration)
                    io.to(`players${lobbyId}`).emit("round-started", roundDuration)
                }
            })

            //This is for getting all the questions a user has answered.
            //It is not implemented on the frontend, so it is not being used but could be nice to add in the future.
            // socket.on("getResults", () => {
            //     const lobbyId = socketToLobbyId.get(socket.id)!

            //     try {
            //         const game = getGame(lobbyId)
            //         const user = game.users.get(socket.id)
            //         const results = user?.questions
            //         const res: Statistic[] = []
            //         results?.forEach(function (value, key) {
            //             res.push(
            //                 new Statistic(
            //                     key.question,
            //                     key.answer,
            //                     key.difficulty,
            //                     value.correct,
            //                     value.attempts
            //                 )
            //             )
            //         })
            //         socket.emit("result", JSON.stringify(res))
            //     } catch (error) {
            //         console.error(error)
            //     }
            // })

            /**
             * Ghost train function that gets the average score and best score for the current round played
             * These scores are used to determain the speed of the ghost trains on the lecturers screen
             */
            socket.on("getGhostTrains", async () => {
                try {
                    const lobbyId = socketToLobbyId.get(socket.id)!

                    const game = getGame(lobbyId)
                    const round = game.rounds[game.round]
                    const roundId: number = round.id

                    const ghostTrainScores = await getGhostTrainScores(roundId)

                    socket.emit("ghost-trains", ghostTrainScores)
                } catch (error) {
                    console.log(error)
                }
            })

            /**
             * This function changes the theme for all users in the game, when the lecturers chooses a different one
             */
            socket.on("themeSelected", (theme: string) => {
                const lobbyId = socketToLobbyId.get(socket.id)!
                themes.set(lobbyId, theme)
                io.to(`players${lobbyId}`).emit("themeChange", theme)
            })

            /**
             * Called when a user joins a lobby to get the correct theme, even if lecturer changed it
             * before the user joined.
             */
            socket.on("getTheme", () => {
                const lobbyId = socketToLobbyId.get(socket.id)
                if (lobbyId === undefined) return
                // For some reason even though it is specified as a number in the map, lobbyId is a string
                // so this extra conversion is needed to get the correct key
                const lobbyIdString = lobbyId.toString()
                const theme = themes.get(parseInt(lobbyIdString))
                socket.emit("themeChange", theme)
            })

            /**
             * Gets the amount of mandatory questions in this round
             * This is used to determine when the user needs to get the difficulty selections screen
             */
            socket.on("getMandatoryNum", () => {
                const lobbyId = socketToLobbyId.get(socket.id)!
                const game = getGame(lobbyId)
                const num = game.getMandatoryNum()
                socket.emit("mandatoryNum", num)
            })

            /**
             * Authentication function that has a hardcoded password
             * This function is used when trying to create a game so only people who know the password can create them
             */
            socket.on("authenticate", (password: string) => {
                if (password === "matematica123") {
                    socket.emit("authenticated", true)
                } else {
                    socket.emit("authenticated", false)
                }
            })

            socket.on("getInformation", async () => {
                try {
                    const lobbyId = socketToLobbyId.get(socket.id)!

                    const game = getGame(lobbyId)
                    
                    const round = game.rounds[game.round]
                    const topic = round.subject
                    const teamName = game.teamName

                    const lobbyIdString = lobbyId.toString()
                    const theme = themes.get(parseInt(lobbyIdString))
                    
                    io.to(`players${lobbyId}`).emit("round-information", ({
                        topic: topic,
                        teamName: teamName,
                        theme: theme
                    }))
                    io.to(`lectuer${lobbyId}`).emit("round-information", ({
                        topic: topic,
                        teamName: teamName,
                        theme: theme
                    }))

                } catch (error) {
                    console.log(error)
                }
            })
        })

        return io
    },
}
