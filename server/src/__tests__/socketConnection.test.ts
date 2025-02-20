import { createServer } from "http"
import { io as ioc } from "socket.io-client"
import app from "../app"
import sinon from "sinon"
import mongoose from "mongoose"
import { Game } from "../objects/gameObject"
import { Statistic } from "../objects/statisticObject"
import { User } from "../objects/userObject"
const roundDBControllerModule = require("../controllers/roundDBController")
const gameControllerModule = require("../controllers/gameController")
const scoreDBControllerModule = require("../controllers/scoreDBController")

describe("Test successfull connection", () => {
    let server, clientSocket1, clientSocket2, lecturerSocket
    //Function stubs
    let getIRoundsStub,
        addGameStub,
        getGameStub,
        endRoundStub,
        getCheckpointsStub,
        saveNewScoreStub,
        getAllScoresStub,
        calculateStatisticsStub
    //Object stubs
    let roundStub, gameStub, scoreStub, usersStub
    //Some standard variables
    let mandatoryQuestion, bonusQuestionEasy, bonusQuestionHard
    let playerCount, eventCounter: number
    const lobbyId = 3456
    const topics = ["Determinants", "Diagonilization"]
    const study = "CSE"
    const teamName1 = "Team1"
    const checkpoint = ["Team1", 200]
    const stats = new Statistic("question1", "easy", 1, 2)
    const user1 = new User()
    user1.score += 50

    beforeEach(function (done) {
        //Setting up the server
        server = createServer(app)

        const socketio = require("../socketConnection")
        socketio.getIo(server)

        server.listen(5000)

        //Setting some default values
        playerCount = 0
        eventCounter = 0

        mandatoryQuestion = { question: "What is 2 + 2", answer: "4", id: "1", type: "open" }
        bonusQuestionEasy = {
            question: "What is 1 + 1",
            answer: "2",
            id: "2",
            difficulty: "easy",
            type: "open",
        }
        bonusQuestionHard = {
            question: "What is 6 + 6",
            answer: "12",
            id: "3",
            difficulty: "hard",
            type: "mc",
        }

        //Stubbbed values
        roundStub = sinon.createStubInstance(mongoose.Document)
        roundStub.subject = "Linear Algebra"
        roundStub.study = ["CSE"]
        roundStub.mandatory_questions = [mandatoryQuestion]
        roundStub.bonus_questions = [bonusQuestionEasy, bonusQuestionHard]
        roundStub.id = "5"
        usersStub = {
            get: sinon.stub().returns(user1),
            delete: sinon.stub(),
            size: 1,
        }
        gameStub = {
            getNewQuestion: sinon.stub().resolves(mandatoryQuestion),
            checkAnswer: sinon.stub(),
            attemptChecker: sinon.stub().returns(1),
            isMandatoryDone: sinon.stub().returns(false),
            addCheckpoint: sinon.stub(),
            calculateStatistics: sinon.stub().returns([stats]),
            getMandatoryNum: sinon.stub().returns(2),
            correct: 2,
            incorrect: 1,
            avgScore: 50,
            totalScore: 100,
            rounds: [roundStub],
            round: 0,
            checkpoints: [],
            users: usersStub,
        }
        gameStub.checkAnswer.callsFake((socketid, answer) => {
            if (answer === 4) {
                return [true, 50]
            }
            return [false, 0]
        })
        scoreStub = sinon.createStubInstance(mongoose.Document)
        scoreStub.id = "5"

        //Stubbed functions
        getIRoundsStub = sinon.stub(roundDBControllerModule, "getIRounds").resolves([roundStub])
        addGameStub = sinon.stub(gameControllerModule, "addGame")
        getGameStub = sinon.stub(gameControllerModule, "getGame").returns(gameStub)
        endRoundStub = sinon.stub(gameControllerModule, "endRound").returns(true)
        getCheckpointsStub = sinon
            .stub(scoreDBControllerModule, "getCheckpoints")
            .resolves([checkpoint])
        saveNewScoreStub = sinon.stub(scoreDBControllerModule, "saveNewScore")
        getAllScoresStub = sinon.stub(scoreDBControllerModule, "getAllScores").resolves([scoreStub])

        //Setting up the sockets to make sure all are connected
        lecturerSocket = require("socket.io-client")("http://localhost:5000")
        lecturerSocket.on("connect", () => {
            clientSocket1 = require("socket.io-client")("http://localhost:5000")
            clientSocket1.on("connect", () => {
                clientSocket2 = require("socket.io-client")("http://localhost:5000")
                clientSocket2.on("connect", () => {
                    done()
                })
            })
        })
    })

    afterEach(function (done) {
        //Close all connections
        lecturerSocket.close()
        clientSocket1.close()
        clientSocket2.close()
        server.close()

        //Restore mocks
        sinon.restore()

        done()
    })

    test("Create and Join lobby test", (done) => {
        const lobbyId = 3456
        lecturerSocket.on("new-player-joined", (players) => {
            expect(players).toBe(1)
            setTimeout(() => {
                done()
            }, 100)
        })
        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket1.emit("joinLobby", lobbyId)
    })

    test("Start game test", (done) => {
        clientSocket1.on("round-started", () => {
            sinon.assert.calledOnce(getIRoundsStub)
            sinon.assert.calledOnce(addGameStub)
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket1.emit("joinLobby", lobbyId)
        setTimeout(() => {
            lecturerSocket.emit("startGame", lobbyId, topics, study, teamName1)
        }, 200)
    })

    test("0 players after disconnect in lobby", (done) => {
        lecturerSocket.on("new-player-joined", (players) => {
            expect(players).toBe(playerCount)
        })
        lecturerSocket.emit("createLobby", lobbyId)
        playerCount++
        clientSocket1.emit("joinGame", lobbyId)
        playerCount--
        clientSocket1.disconnect()

        setTimeout(() => {
            done()
        }, 100)
    })

    test("1 player after disconnect in lobby", (done) => {
        lecturerSocket.on("new-player-joined", (players) => {
            expect(players).toBe(playerCount)
        })
        lecturerSocket.emit("createLobby", lobbyId)
        playerCount++
        clientSocket1.emit("joinGame", lobbyId)
        playerCount++
        clientSocket2.emit("joinGame", lobbyId)
        playerCount--
        clientSocket1.disconnect()

        setTimeout(() => {
            done()
        }, 100)
    })

    test("Get new question test", (done) => {
        clientSocket1.on("get-next-question", (question) => {
            expect(question).toEqual(mandatoryQuestion)
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket1.emit("joinLobby", lobbyId)

        setTimeout(() => {
            clientSocket1.emit("getNewQuestion", "easy")
        }, 100)
    })

    test("Check correct answer on mandatory test", (done) => {
        gameStub.avgScore = 50
        lecturerSocket.on("score", (result) => {
            expect(result).toEqual({ score: 50, accuracy: 66 })
            eventCounter++
        })
        clientSocket1.on("rightAnswer", (score) => {
            expect(score).toBe(50)
            eventCounter++
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket1.emit("joinLobby", lobbyId)

        setTimeout(() => {
            clientSocket1.emit("checkAnswer", 4)
        }, 100)

        setTimeout(() => {
            expect(eventCounter).toEqual(2)
            done()
        }, 200)
    })

    test("Check correct answer on bonus test", (done) => {
        //Test on bonus
        gameStub.isMandatoryDone.callsFake(() => {
            return true
        })
        gameStub.avgScore = 50

        clientSocket1.on("chooseDifficulty", () => {
            eventCounter++
        })

        clientSocket1.on("rightAnswer", (score) => {
            expect(score).toBe(50)
            eventCounter++
        })

        lecturerSocket.on("score", (result) => {
            expect(result).toEqual({ score: 50, accuracy: 66 })
            eventCounter++
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket1.emit("joinLobby", lobbyId)

        setTimeout(() => {
            clientSocket1.emit("checkAnswer", 4)
        }, 100)

        setTimeout(() => {
            expect(eventCounter).toEqual(3)
            done()
        }, 300)
    })

    test("Check incorrect answer 0 attempts on mandatory test", (done) => {
        //Test 0 attempts
        gameStub.attemptChecker.callsFake((socketid) => {
            return 0
        })

        clientSocket1.on("wrongAnswer", (num) => {
            expect(num).toBe(0)
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket1.emit("joinLobby", lobbyId)

        setTimeout(() => {
            clientSocket1.emit("checkAnswer", 3)
        }, 200)
    })

    test("Check incorrect answer 0 attempts on bonus test", (done) => {
        //Test 0 attempts
        gameStub.attemptChecker.callsFake((socketid) => {
            return 0
        })
        //Test on bonus
        gameStub.isMandatoryDone.callsFake(() => {
            return true
        })

        clientSocket1.on("wrongAnswer", (num) => {
            expect(num).toBe(0)
            eventCounter++
        })
        clientSocket1.on("chooseDifficulty", () => {
            eventCounter++
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket1.emit("joinLobby", lobbyId)

        setTimeout(() => {
            clientSocket1.emit("checkAnswer", 3)
        }, 100)

        setTimeout(() => {
            expect(eventCounter).toEqual(2)
            done()
        }, 200)
    })

    test("Check incorrect answer 1 attempt test", (done) => {
        clientSocket1.on("wrongAnswer", (num) => {
            expect(num).toBe(1)
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket1.emit("joinLobby", lobbyId)

        setTimeout(() => {
            clientSocket1.emit("checkAnswer", 3)
        }, 100)
    })

    test("Add checkpoint test", (done) => {
        lecturerSocket.on("get-checkpoints", (checkpoints) => {
            expect(checkpoints).toEqual([checkpoint])
            sinon.assert.calledOnce(getCheckpointsStub)
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket1.emit("joinLobby", lobbyId)

        setTimeout(() => {
            lecturerSocket.emit("addCheckpoint", 50)
        }, 100)
    })

    test("Ending round test", (done) => {
        clientSocket2.on("round-ended", () => {
            eventCounter++
            sinon.assert.calledOnce(saveNewScoreStub)
        })
        lecturerSocket.on("get-all-scores", (result) => {
            eventCounter++
            sinon.assert.calledOnce(getAllScoresStub)
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket2.emit("joinLobby", lobbyId)

        setTimeout(() => {
            lecturerSocket.emit("endRound")
        }, 100)

        setTimeout(() => {
            expect(eventCounter).toBe(2)
            done()
        }, 200)
    })

    test("Get lecturer statistics not last round test", (done) => {
        gameStub.rounds = [roundStub, roundStub]
        lecturerSocket.on("statistics", (stats) => {
            sinon.assert.calledOnce(gameStub.calculateStatistics)
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket1.emit("joinLobby", lobbyId)

        setTimeout(() => {
            lecturerSocket.emit("getLecturerStatistics")
        }, 100)
    })

    test("Get lecturer statistics last round test", (done) => {
        lecturerSocket.on("statistics", (stats) => {
            sinon.assert.calledOnce(gameStub.calculateStatistics)
            eventCounter++
        })
        lecturerSocket.on("game-ended", () => {
            eventCounter++
        })
        clientSocket2.on("game-ended", () => {
            eventCounter++
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket2.emit("joinLobby", lobbyId)

        setTimeout(() => {
            lecturerSocket.emit("getLecturerStatistics")
        }, 100)

        setTimeout(() => {
            expect(eventCounter).toBe(3)
            done()
        }, 500)
    })

    test("Start next round test", (done) => {
        clientSocket2.on("round-started", () => {
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket2.emit("joinLobby", lobbyId)

        setTimeout(() => {
            lecturerSocket.emit("startNextRound")
        }, 100)
    })

    test("Start next round, last round test", (done) => {
        endRoundStub.returns(false)
        clientSocket2.on("end-game", () => {
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket2.emit("joinLobby", lobbyId)

        setTimeout(() => {
            lecturerSocket.emit("startNextRound")
        }, 100)
    })

    test("Select theme test", (done) => {
        clientSocket2.on("themeChange", (theme) => {
            expect(theme).toBe("boat")
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("createLobby", lobbyId)
        clientSocket2.emit("joinLobby", lobbyId)
        lecturerSocket.emit("themeSelected", "boat")
    })

    test("Get mandatory number test", (done) => {
        lecturerSocket.on("mandatoryNum", (number) => {
            expect(number).toBe(2)
            sinon.assert.calledOnce(gameStub.getMandatoryNum)
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("getMandatoryNum")
    })

    test("Authenticate correctly test", (done) => {
        lecturerSocket.on("authenticated", (authenticated) => {
            expect(authenticated).toBe(true)
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("authenticate", "matematica123")
    })

    test("Authenticate incorrectly test", (done) => {
        lecturerSocket.on("authenticated", (authenticated) => {
            expect(authenticated).toBe(false)
            setTimeout(() => {
                done()
            }, 100)
        })

        lecturerSocket.emit("authenticate", "password")
    })
})
