import type { Socket } from "socket.io"
import { addGame, getGame, endRound, getRoundDuration, gameIsInProgress } from "./controllers/gameController"
import { getIRounds, getTopicsByStudy } from "./controllers/roundDBController"
import { endLobby } from "./controllers/lobbyController"
import {
    saveNewScore,
    getAllScores,
    getCheckpoints,
    getGhostTrainScores,
    getGhostTeams,
    getBestTeamFinalScore,
    getAllDefaultTeams,
    saveMultipleScores,
} from "./controllers/scoreDBController"
import type { Game } from "./objects/gameObject"
import { Statistic } from "./objects/statisticObject"
import { addNewStudy, getAllStudies } from "./controllers/studyDBController"
import { addNewExercise, exerciseExists, findExercise, getAllExercises, updateExercise } from "./controllers/exerciseDBController"
import type { IStudy } from "./models/studyModel"
import { Exercise, type IExercise } from "./models/exerciseModel"
import { addExercisesToTopic, addNewTopic, addStudiesToTopic, getAllExercisesFromTopic, getAllStudiesFromTopic, getAllTopicData, getAllTopicNames, getSelectedITopics, getTopicNamesByStudy, updateTopic, updateTopicExercises, updateTopicName } from "./controllers/topicDBController"
import { createHash } from 'crypto';
import { User } from "./objects/userObject"
import { getInterpolatedGhostTeams, getRaceInformation, getRaceTrackEndScore, getTeamScoreData } from "./utils/socketUtils"
import { generateFakeScores, GeneratorOptions } from "./utils/defaultScoresGenerator"

const socketToLobbyId = new Map<string, number>()
const themes = new Map<number, string>()
const password_hash = "c4cefed12d880cfbdfcf30a2e898ad4686a78948eb8614247291315b033a3883"

function hashString(input: string): string {
    const hash = createHash('sha256')
    hash.update(input)
    return hash.digest('hex')
}

module.exports = {
    getIo: (server) => {
        const io = require("socket.io")(server, {
            cors: {
                origin: "*",
                methods: ['GET', 'POST']
            },
            handlePreflightRequest: (req, res) => {
                const headers = {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET, POST",
                  "Access-Control-Allow-Headers": "Content-Type"
                };
                res.writeHead(200, headers);
                res.end();
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
                    const userId = socket.data.userId;
                    const game = getGame(lobbyId);
                    const user = game.users.get(userId);
                    if (user) {
                        user.socketId = socket.id;
                        user.disconnected = false;
                    }

                    if (socket.data.lastRecordedUserData !== undefined) {
                        game.totalScore += socket.data.lastRecordedUserData.score
                        game.avgScore = game.totalScore / game.getNumberOfActiveUsers()
                    }                    

                    const numberOfPlayers: number = io.sockets.adapter.rooms.get(`players${lobbyId}`).size
                    const teamScoreData = getTeamScoreData(game, numberOfPlayers)

                    io.to(`lecturer${lobbyId}`).emit("score", teamScoreData)
                    io.to(`players${lobbyId}`).emit("score", teamScoreData)

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
            socket.on("joinLobby", async (lobbyId: number, userId: string) => {
                socket.data.userId = userId // Setting the userId to the socket data for later use (used for identifying reconnecting players)
                
                const playersRoom = io.sockets.adapter.rooms.get(`players${lobbyId}`);
                if (playersRoom != undefined) {
                    const isUserAlreadyInRoom = Array.from(playersRoom).some((socketId) => {
                        const playerSocket = io.sockets.sockets.get(socketId) as Socket | undefined;
                        return playerSocket?.data.userId === userId;
                    });

                    if (isUserAlreadyInRoom) {
                        socket.emit("already-in-room");
                        return; // Exit early if the user is already in the room
                    }
                }

                console.log("JOINED LOBBY: " + (socket.data.userId as string))
                void socket.join(`players${lobbyId}`)
                socketToLobbyId.set(socket.id, lobbyId)
                let offsetQuestionNumber = false;

                // If the game is in progress, update the socket ID and mark as reconnected or create a new user
                // who has joined the lobby mid-game
                if (gameIsInProgress(lobbyId)) {
                    const game = getGame(lobbyId);

                    if (game.users.has(userId)) {

                        const user = game.users.get(userId)

                        // Check that user hasn't attempted reconnecting in the last 30 seconds, to prevent abusing reconnections
                        if (user !== undefined) {
                            const currentTime = Date.now()
                            const lastConnectionTime = user.lastConnectionTime
                            if (currentTime - lastConnectionTime < 30000) {
                                socket.emit("blocked-user-reconnection", lastConnectionTime + 30000)
                                void socket.leave(`players${lobbyId}`)
                                return
                            }
                        }
                        
                        // Update the socket ID and mark as reconnected
                        console.log("RECONNECTED USER:")
                        if (user !== undefined) {
                            user.lastConnectionTime = Date.now()
                            // user.attemptedToAnswerQuestion = false
                            user.socketId = socket.id;
                            user.disconnected = false;
                            console.log(user.questions)

                            if (user.getQuestionIds().length > 0) {
                                if (game.hasUserAttemptedNonMandatoryQuestion(userId) && !user.usedUpAttemptsOnLastQuestion) {
                                    user.questions = new Map(Array.from(user.questions.entries()).slice(0, -1))
                                } 
                                else if (!user.usedUpAttemptsOnLastQuestion){
                                    offsetQuestionNumber = true;
                                }
                            }
                            else {
                                user.questions = new Map()
                            }
                        }              

                        const difficulties = ["Easy", "Medium", "Hard"]
                        for (const difficulty of difficulties) {
                                const usedUpAllQuestionsForDifficulty = game.checkIfUserAnsweredAllQuestionsOfDifficulty(socket.data.userId, difficulty)
                            if (usedUpAllQuestionsForDifficulty) {
                                const answeredAllQuestions = game.checkIfUserAnsweredAllQuestions(socket.data.userId)
                                socket.emit("disable-difficulty", difficulty)
        
                                if (answeredAllQuestions) {
                                    socket.emit("answered-all-questions")
                                }
                            }
                        }
                        
                        game.totalScore += user?.score as number
                        game.avgScore = game.totalScore / game.getNumberOfActiveUsers()
                    } 
                    
                    else {
                        // Add new user with initial data
                        console.log("NEW USER JOINED")
                        const user = new User();
                        user.socketId = socket.id;
                        user.isOnMandatory = false
                        user.lastConnectionTime = Date.now()
                        game.users.set(userId, user);
                    }

                    const roundDuration = getRoundDuration(lobbyId)
                    const elapsedTimeInSeconds = (Date.now() - game.roundStartTime) / 1000;
                    const remainingTimeInSeconds = Math.max(0, roundDuration - elapsedTimeInSeconds);
                    const user = game.users.get(userId);

                    // Also make sure a difficulty is disabled if no questions are available for a specific difficulty
                    const difficulties = ["Easy", "Medium", "Hard"]
                    for (const difficulty of difficulties) {
                        const usedUpAllQuestionsForDifficulty = game.checkIfUserAnsweredAllQuestionsOfDifficulty(socket.data.userId, difficulty)
                        
                        console.log("Used up all questions for difficulty: " + difficulty + " " + usedUpAllQuestionsForDifficulty.toString())
                        if (usedUpAllQuestionsForDifficulty) {
                            const answeredAllQuestions = game.checkIfUserAnsweredAllQuestions(socket.data.userId)
                            socket.emit("disable-difficulty", difficulty)

                            if (answeredAllQuestions) {
                                socket.emit("answered-all-questions")
                            }
                        }
                    }

                    let attempts =  user?.questions.size
                    if (offsetQuestionNumber) attempts = attempts != undefined ? attempts - 1 : 0

                    const lapEndScore = game.lapEndScore
                    const raceInformation = getRaceInformation(game, lobbyId, themes)

                    const numberOfPlayers: number = io.sockets.adapter.rooms.get(`players${lobbyId}`).size
                    const teamScoreData = getTeamScoreData(game, numberOfPlayers)
                
                    socket.emit("ghost-teams", game.ghostTeams)
                    socket.emit("race-track-end-score", lapEndScore)
                    socket.emit("round-information", (raceInformation))

                    socket.emit("score", teamScoreData)
                    socket.emit("currentStreaks", user?.streaks)
                    socket.emit("joined-game-in-progress", roundDuration, remainingTimeInSeconds, attempts, user?.score)
                }                
                
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

                    const userId = socket.data.userId
                    if (!(userId as string)) return

                    const user = game.users.get(userId)
                    if (user === undefined) return

                    user.disconnected = true;

                    game.totalScore -= user.score
                    socket.data.lastRecordedUserData = user

                    game.avgScore = game.totalScore / game.getNumberOfActiveUsers()

                    const numberOfPlayers: number = io.sockets.adapter.rooms.get(`players${lobbyId}`).size
                    const teamScoreData = getTeamScoreData(game, numberOfPlayers)

                    io.to(`lecturer${lobbyId}`).emit("score", teamScoreData)
                    io.to(`players${lobbyId}`).emit("score", teamScoreData)
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
                    try {
                        const selectedTopics = await getSelectedITopics(topics)
                        if (io.sockets.adapter.rooms.get(`players${lobbyId}`).size == 0) return
                        const room = io.sockets.adapter.rooms.get(`players${lobbyId}`) as Set<string> | undefined
                        if (!room || room.size === 0) return

                        const userIds: string[] = Array.from(room).map(socketId => {
                            const socket = io.sockets.sockets.get(socketId);
                            return socket?.data.userId as string;
                        }).filter(userId => userId !== undefined)

                        addGame(selectedTopics, roundDurations, teamName, userIds, lobbyId, study)
                        const roundDuration = getRoundDuration(lobbyId)
                        io.to(`lecturer${lobbyId}`).emit("round-duration", roundDuration)
                        io.to(`players${lobbyId}`).emit("round-started", roundDuration)
                    } catch (error) {
                        console.error(error)
                    }

                    try {
                        const lobbyId = socketToLobbyId.get(socket.id)!
    
                        const game = getGame(lobbyId)
                        const topic = game.topics[game.currentTopicIndex]
                        const topicId: string = topic._id
                        game.numberOfPlayersAtStart = io.sockets.adapter.rooms.get(`players${lobbyId}`).size
                        const ghostTrainScores = await getGhostTrainScores(topicId)
    
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
                    const user = game.users.get(socket.data.userId)

                    if (user == null)
                        {
                            throw new Error("User not found")
                        }

                    if (difficulty == undefined && game.hasUserJoinedLate(socket.data.userId)) {
                        socket.emit("chooseDifficulty")
                        return
                    }

                    if ((difficulty != undefined 
                        || (game.mandatoryExercisesExistForCurrentTopic() 
                                && user.isOnMandatory)
                        )) 
                    {
                        let exercise: IExercise | undefined = undefined

                        if (user.getQuestionIds().length > 0 && !user.usedUpAttemptsOnLastQuestion && (difficulty == undefined || user.currentQuestion.difficulty === difficulty)) {
                            exercise = user.currentQuestion
                            game.initializeUserAttempts(exercise, user)
                        } else{
                            exercise = game.getNewExercise(socket.data.userId, difficulty)
                            user.usedUpAttemptsOnLastQuestion = false
                        }

                        let scoreToGain = 0;
                        if (exercise !== undefined && user !== undefined) {
                            scoreToGain = game.calculateScore(exercise, user);
                        }

                        // socket.emit("get-next-question", question)
                        socket.emit("get-next-grasple-question", exercise, scoreToGain, user.getQuestionIds().length)
    
                        const usedUpAllQuestionsForDifficulty = game.checkIfUserAnsweredAllQuestionsOfDifficulty(socket.data.userId, difficulty)
                        if (usedUpAllQuestionsForDifficulty) {
                            const answeredAllQuestions = game.checkIfUserAnsweredAllQuestions(socket.data.userId)
                            socket.emit("disable-difficulty", difficulty)
    
                            if (answeredAllQuestions) {
                                socket.emit("answered-all-questions")
                            }
                        }
                    }
                    
                    else {
                        game.makeUserNotOnMandatory(socket.data.userId)
                        socket.emit("chooseDifficulty")
                    }

                } catch (error) {
                    console.error(error)
                }
            })

            socket.on("questionAnswered", (answeredCorrectly: boolean, difficulty: string) => {
                const lobbyId = socketToLobbyId.get(socket.id)!
                try {
                    console.log("ANswered " + answeredCorrectly.toString())
                    const game = getGame(lobbyId)
                    const score = game.processUserAnswer(socket.data.userId, answeredCorrectly, difficulty)

                    const user = game.users.get(socket.data.userId)
                    if (user !== undefined) socket.emit("currentStreaks", user.streaks)
                    
                    if (user != undefined) {
                        user.usedUpAttemptsOnLastQuestion = true
                    }

                    console.log("Answered mandatory: " + game.allMandatoryQuestionsAnswered(socket.data.userId).toString())
                    if (game.allMandatoryQuestionsAnswered(socket.data.userId)) {
                        game.makeUserNotOnMandatory(socket.data.userId)
                    }

                    if (answeredCorrectly) {
                        socket.emit("rightAnswer", score)
                        if (game.isMandatoryDone(socket.data.userId)) socket.emit("chooseDifficulty")

                        const numberOfPlayers: number = io.sockets.adapter.rooms.get(`players${lobbyId}`).size
                        const teamScoreData = getTeamScoreData(game, numberOfPlayers)
                        
                        io.to(`lecturer${lobbyId}`).emit("score", teamScoreData)
                        io.to(`players${lobbyId}`).emit("score", teamScoreData)
                    } else {
                        if (game.allMandatoryQuestionsAnswered(socket.data.userId)) socket.emit("chooseDifficulty")
                    }
                } catch (error) {
                    console.error(error)
                }
            })


            /**
             * DEPRECATED
             * Checks the answer a user gave
             * If they answered incorrect while having attempts left, they can try again
             * If they have no more mandatory questions left, they get the choose difficulty screen
             * If they answered correctly the new score gets sent to the lecturer
             */
            // socket.on("checkAnswer", (answer: string, difficulty: string) => {
            //     const lobbyId = socketToLobbyId.get(socket.id)!
            //     try {
            //         console.log(`Given answer: ${answer}`)
            //         const game = getGame(lobbyId)
            //         const [correctAnswer, score] = game.checkAnswer(socket.id, answer, difficulty)
            //         const attempts = game.attemptChecker(socket.id)

            //         const user = game.users.get(socket.id)
            //         if (user !== undefined) socket.emit("currentStreaks", user.streaks)

            //         if (correctAnswer) {
            //             socket.emit("rightAnswer", score)
            //             if (game.isMandatoryDone(socket.id)) socket.emit("chooseDifficulty")
            //             const accuracy = (game.correct / (game.incorrect + game.correct)) * 100
            //             const numberOfPlayers: number = io.sockets.adapter.rooms.get(`players${lobbyId}`).size
                        
            //             io.to(`lecturer${lobbyId}`).emit("score", {
            //                 score: Math.floor(game.totalScore),
            //                 accuracy: Math.floor(accuracy),
            //                 averageTeamScore: Math.floor(game.totalScore / numberOfPlayers)
            //             })
            //             io.to(`players${lobbyId}`).emit("score", {
            //                 score: Math.floor(game.totalScore),
            //                 accuracy: Math.floor(accuracy),
            //                 averageTeamScore: Math.floor(game.totalScore / numberOfPlayers)
            //             })
            //         } else if (attempts === 0) {
            //             socket.emit("wrongAnswer", 0)
            //             if (game.isMandatoryDone(socket.id)) socket.emit("chooseDifficulty")
            //         } else {
            //             socket.emit("wrongAnswer", attempts)
            //         }
            //     } catch (error) {
            //         console.error(error)
            //     }
            // })

            /**
             * Adds a checkpoint to the gameobject
             * Also sends back all the scores of other teams at that checkpoint
             */
            socket.on("addCheckpoint", async (seconds: number) => {
                const lobbyId = socketToLobbyId.get(socket.id)!

                try {
                    const game = getGame(lobbyId)
                    game.addCheckpoint(seconds)

                    const topic = game.topics[game.currentTopicIndex]
                    const result = await getCheckpoints(topic._id, game.checkpoints.length - 1)
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
                        game.topics[game.currentTopicIndex]._id,
                        game.roundDurations[game.currentTopicIndex],
                        game.study,
                        accuracy
                    )
                    const currentTopic = game.topics[game.currentTopicIndex]
    
                    const result = await getAllScores(currentTopic._id)
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
                    const interpolatedGhostTeams = await getInterpolatedGhostTeams(game)
                    console.log("INTERPOLATED GHOSTS")
                    console.log(interpolatedGhostTeams)
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
                    const halvedHighestFinalScore = await getRaceTrackEndScore(game)
                    game.lapEndScore = halvedHighestFinalScore

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

                stats.sort((a, b) => {
                    // First, sort by incorrectly answered in descending order
                    if (b.incorrectlyAnswered !== a.incorrectlyAnswered) {
                        return b.incorrectlyAnswered - a.incorrectlyAnswered;
                    }
                    
                    // If incorrectly answered are the same, sort by accuracy in ascending order
                    const accuracyA = a.correctlyAnswered / (a.correctlyAnswered + a.incorrectlyAnswered);
                    const accuracyB = b.correctlyAnswered / (b.correctlyAnswered + b.incorrectlyAnswered);
                    return accuracyA - accuracyB;
                });

                socket.emit("statistics", JSON.stringify(stats))

                //If this was the last round display end game button for lecturer
                //And let the users go back to homescreen whenever they want
                if (game.currentTopicIndex + 1 >= game.topics.length) {
                    io.to(`players${lobbyId}`).emit("game-ended")
                    socket.emit("game-ended")
                }
            })

            /**
             * Once the lecturer screen countdown is complete, start the game for all players regardless of their individual countdowns
             */
            socket.on("beginRace", () => {
                const lobbyId = socketToLobbyId.get(socket.id)!    
                const game = getGame(lobbyId)
                game.roundStartTime = Date.now()
                io.to(`players${lobbyId}`).emit("race-started")
            })

            /**
             * Starts the next round by resetting all the values for the game and sending round-started to all players
             */
            socket.on("startNextRound", () => {
                const lobbyId = socketToLobbyId.get(socket.id)!

                //Reset the round to prepare for the next
                const continueGame = endRound(lobbyId)

                if (!continueGame) {
                    io.to(`players${lobbyId}`).emit("end-game")
                    endLobby(lobbyId)
                }
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
                    const topic = game.topics[game.currentTopicIndex]
                    const topicId: string = topic._id

                    const ghostTrainScores = await getGhostTrainScores(topicId)

                    socket.emit("ghost-trains", ghostTrainScores)
                } catch (error) {
                    console.log(error)
                }
            })

            socket.on("checkForDisabledDifficulties", () => {
                const lobbyId = socketToLobbyId.get(socket.id)!
                const game = getGame(lobbyId)

                // Also make sure a difficulty is disabled if no questions are available for a specific difficulty
                const difficulties = ["Easy", "Medium", "Hard"]
                for (const difficulty of difficulties) {
                    const usedUpAllQuestionsForDifficulty = game.checkIfUserAnsweredAllQuestionsOfDifficulty(socket.data.userId, difficulty)
                    
                    console.log("Used up all questions for difficulty: " + difficulty + " " + usedUpAllQuestionsForDifficulty.toString())
                    if (usedUpAllQuestionsForDifficulty) {
                        const answeredAllQuestions = game.checkIfUserAnsweredAllQuestions(socket.data.userId)
                        socket.emit("disable-difficulty", difficulty)

                        if (answeredAllQuestions) {
                            socket.emit("answered-all-questions")
                        }
                    }
                }

                socket.emit("ready-for-question-request")
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
                try {
                    const lobbyId = socketToLobbyId.get(socket.id)!
                    const game = getGame(lobbyId)
                    const num = game.getMandatoryNum()
                    socket.emit("mandatoryNum", num)
                } catch (error) {
                    console.log(error)
                }
            })

            /**
             * Returns a list of all the studies (study programmes) stored in the database
             */
            socket.on("getAllStudies", async () => {
                try {
                    const allStudies = await getAllStudies();
                    socket.emit("all-studies", allStudies);
                } catch (error) {
                    socket.emit('error', {message: error.message} )
                }
            })

            /**
             * Updates the exercise with the given exerciseId (grasple question ID), or if it does not exist, creates a new one
             */
            socket.on("updateExercise", async(exerciseId: number, updateData: { url: string, difficulty: string, numOfAttempts: number, name: string }) => {
                try {
                    const updatedExercise = await updateExercise(exerciseId, updateData);
                    socket.emit("updated-exercise", updatedExercise);
                } catch (error) {
                    socket.emit("error", { message: error.message })
                }
            })

            /**
             * Returns a list of all topics (rounds) stored in the database
             */
            socket.on("getAllTopics", async() => {
                try {
                    const topics = await getAllTopicData();
                    socket.emit("all-topics", topics);
                } catch (error) {
                    socket.emit("error", error.message);
                }
            })

            /**
             * Returns a list of all exercises stored in the database
             */
            socket.on("getAllExercises", async() => {
                try {
                    const exercises = await getAllExercises();
                    socket.emit("all-exercises", exercises);
                } catch (error) {
                    socket.emit("error", error.message);
                }
            })

            /**
             * Returns a list of all default teams (fake teams) stored in the database
             */
            socket.on("getAllDefaultTeams", async() => {
                try {
                    const defaultTeams = await getAllDefaultTeams();
                    socket.emit("all-default-teams", defaultTeams);
                } catch (error) {
                    socket.emit("error", error.message);
                }
            })

            socket.on("addDefaultTeams", async (topicId: string, teamsToAddCount: number, avgTimePerQuestion: number) => {
                try {
                    const opts: GeneratorOptions = {
                        studies: ['CSE', 'AE', 'MCH', 'MAR', 'CE'],
                        topicId: topicId,
                        numTeams: teamsToAddCount,
                        avgExpectedTime: avgTimePerQuestion,
                    }

                    const newTeams = generateFakeScores(opts)
                    await saveMultipleScores(newTeams)

                    // Update values on frontend
                    const defaultTeams = await getAllDefaultTeams();
                    socket.emit("all-default-teams", defaultTeams);
                } catch (error) {
                    socket.emit("error", error.message);
                }
            })

            /**
             * Updates the topic with the given topic id, or if it does not exist, creates a new one
             * Notably, this function updates the mandatory status of each exercise associated with the topic
             */
            socket.on("updateTopic", async (
                topicId: string,  
                name: string, 
                exercises: {
                    exerciseId: number, 
                    updateData: { url: string, difficulty: string, numOfAttempts: number, name: string },
                    isMandatory: boolean
                }[], 
                studyIds: string[]) => {
                    try {
                        const updatedExercises = await Promise.all(exercises.map(async exercise => {
                            const updatedExercise = await updateExercise(exercise.exerciseId, exercise.updateData)
                            return {
                                _id: updatedExercise?._id,
                                isMandatory: exercise.isMandatory
                            }
                        }))

                        
                        const updatedTopic = await updateTopic(topicId, name, updatedExercises, studyIds);
                        socket.emit("updated-topic", updatedTopic);
                    } catch (error) {
                        socket.emit("error", { message: error.message });
                    }
            })

            socket.on("getLobbyData", async (study?: string) => {
                try {
                    const topicNames = await getTopicNamesByStudy(study)
                    const allStudies = await getAllStudies()
                    const lobbyData = {
                        topics: topicNames,
                        studies: allStudies.map(study => ({
                            name: study.name,
                            abbreviation: study.abbreviation
                        }))
                    }
                    socket.emit("lobby-data", lobbyData)
                } catch (error) {
                    console.log(error)
                }
            })

            /**
             * Authentication function that has a hardcoded password
             * This function is used when trying to create a game so only people who know the password can create them
             */
            socket.on("authenticate", (password: string) => {
                if (hashString(password) === password_hash) {
                    socket.emit("authenticated", true)
                } else {
                    socket.emit("authenticated", false)
                }
            })

            socket.on("lecturerPlatformLogin", (password: string) => {
                if (hashString(password) === password_hash) {
                    socket.emit("access-granted", true)
                } else {
                    socket.emit("access-granted", false)
                }
            })

            socket.on("getInformation", async () => {
                try {
                    const lobbyId = socketToLobbyId.get(socket.id)!

                    const game = getGame(lobbyId)
                    
                    const raceInformation = getRaceInformation(game, lobbyId, themes)
                    
                    io.to(`players${lobbyId}`).emit("round-information", (raceInformation))
                    
                    socket.emit("round-information", (raceInformation))

                } catch (error) {
                    console.log(error)
                }
            })
        })

        return io
    },
}
