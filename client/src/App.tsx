import React, { useEffect, useState } from "react"
import "./App.css"
import Home from "./components/Home/Home"
import CreateGame from "./components/CreateGame/CreateGame"
import JoinGame from "./components/JoinGame/JoinGame"
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import TestValues from "./utils/testValues"
import Waiting from "./components/Waiting/Waiting"
import Login from "./components/CreateGame/Login/Login"
import Lobby from "./components/CreateGame/Lobby/Lobby"
import Lecturer from "./components/CreateGame/Lecturer/Lecturer"
import EndGameScreen from "./components/EndGameScreen/EndGameScreen"
import Game from "./components/Game/Game"
import TeamPreview from "./components/RaceThemes/TeamPreview/TeamPreview"
import { Ghost, GraspleExercise, IQuestion, RoundInformation, ServerGhost, Streak } from "./components/RaceThemes/SharedUtils"
import { initializeFrontendGhostObjects } from "./components/RaceThemes/Ghosts/GhostService"
import socket from "./socket"
import testValues from "./utils/testValues"
import { TimeContext } from "./contexts/TimeContext"
import { RaceDataContext } from "./contexts/RaceDataContext"
import LecturerService from "./components/CreateGame/Lecturer/LecturerService"
import { trainMaps } from "./components/RaceThemes/Maps/TrainMaps"
import { ScoreContext } from "./contexts/ScoreContext"
import Leaderboard from "./components/CreateGame/Lecturer/Leaderboard/Leaderboard"
import QuestionStatistics from "./components/CreateGame/Lecturer/QuestionStatistics/QuestionStatistics"
import { useTimer } from "react-timer-hook"
import { QuestionContext } from "./contexts/QuestionContext"
import 'react-notifications-component/dist/theme.css'
import { ReactNotifications } from "react-notifications-component"
import { StreakContext } from "./contexts/StreakContext"
import { RaceProgressContext } from "./contexts/RaceProgressContext"
import { GraspleQuestionContext } from "./contexts/GraspleQuestionContext"
import LecturerPlatform from "./components/LecturerPlatform/LecturerPlatform"
import { Exercise, Study, Topic } from "./components/LecturerPlatform/SharedUtils"
import { TopicDataContext } from "./contexts/TopicDataContext"
import { LobbyData, LobbyDataContext } from "./contexts/LobbyDataContext"
import { DifficultyAvailability, DifficultyAvailabilityContext } from "./contexts/DifficultyAvailabilityContext"

function App() {
    const [lobbyId, setLobbyId] = useState(0)
    const [isPlayer, setIsPlayer] = useState(true)
    const [teamName, setTeamName] = useState("New Team")
    const [theme, setTheme] = useState("Train")
    const [topic, setTopic] = useState("")
    const [study, setStudy] = useState("")
    const [roundDuration, setRoundDuration] = useState<number>(0)
    const [ghostTeams, setGhostTeams] = useState<Ghost[]>([])
    const [startTimer, setStartTimer] = useState<boolean>(false)
    const [fullLapScoreValue, setFullLapScoreValue] = useState<number>(1)
    const [currentScore, setCurrentScore] = useState<number>(0)
    const [currentAccuracy, setCurrentAccuracy] = useState<number>(0)
    const [averageTeamScore, setAverageTeamScore] = useState<number>(0)
    const [allRoundsFinished, setAllRoundsFinished] = useState<boolean>(false)
    const [roundstarted, setRoundStarted] = useState<boolean>(false)
    const [isFirstRound, setIsFirstRound] = useState<boolean>(true)
    const [streaks, setStreaks] = useState<Streak[]>([])
    const [stopShowingRace, setStopShowingRace] = useState<boolean>(false)
    const [loggedIn, setLoggedIn] = useState<boolean>(false)
    const [allExercises, setAllExercises] = useState<Exercise[]>([])
    const [allTopics, setAllTopics] = useState<Topic[]>([])
    const [allStudies, setAllStudies] = useState<Study[]>([])
    const [lobbyData, setLobbyData] = useState<LobbyData>({topics: [], studies: []})
    const [difficultyAvailability, setDifficultyAvailability] = useState<DifficultyAvailability>({
        easy: true,
        medium: true,
        hard: true
    })

    const [currentQuestion, setCurrentQuestion] = useState<IQuestion>({
        question: "",
        answer: "",
        difficulty: "",
        subject: "",
        type: "",
        options: [],
        variants: []
    })
    const [currentGraspleQuestion, setCurrentGraspleQuestion] = useState<GraspleExercise>({
        _id: "",
        name: "",
        exerciseId: 0,
        difficulty: "",
        url: "",
        numOfAttempts: 0,
        isMandatory: false
    })

    const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(0)
    const [numberOfMandatoryQuestions, setNumberOfMandatoryQuestions] = useState<number>(0)

    const navigate = useNavigate()

    const timerExpirationHandler = () => {
        if (roundDuration > 0) {
            setIsFirstRound(curr => false)

            if (!isPlayer) socket.emit("endRound")
                leaderboardNavigationHandler()
        }
    }

    const {
        totalSeconds,
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,
        pause,
        resume,
        restart,
      } = useTimer({ expiryTimestamp: new Date(), autoStart: false, onExpire: timerExpirationHandler })


    const lobbyIdHandler = (id: number) => {
        setLobbyId(curr => id)
        socket.emit("getLobbyData")
    }

    const isPlayerHandler = (isPlayer: boolean) => {
        setIsPlayer(curr => isPlayer)
    }

    const teamNameHandler = (name: string) => {
        setTeamName(name)
    }

    const themeHandler = (theme: string) => {
        setTheme((current) => theme)
    }

    const topicHandler = (topic: string) => {
        setTopic((current) => topic)
    }

    const resetValues = () => {
        setCurrentScore(curr => 0)
        setCurrentAccuracy(curr => 0)
        setStartTimer(curr => false)
    }

    useEffect(() => {
        if (startTimer && roundDuration > 0) {
            console.log("ROUND DURATION: " + roundDuration.toString())
            const time = new Date()
            time.setSeconds(time.getSeconds() + roundDuration)
            restart(time)
        }
    }, [roundDuration, startTimer])

    const gameStartHandler = () => {
        setStartTimer(curr => true)
        if (isPlayer) {
            navigate("/Game")
        }
        else {
            navigate("/Lecturer")
        }
    }

    const initializeRoundValues = (roundDuration: number) => {
        resetValues()
        setRoundDuration(curr => roundDuration) // CHANGE
        setRoundStarted(curr => true)
        setCurrentQuestionNumber(0)
        setAllRoundsFinished(curr => false)
        setStopShowingRace(false)
    
        if (isPlayer) socket.emit("getMandatoryNum")
        navigate("/TeamPreview")
    }

    const nextRoundHandler = () => {
        setRoundStarted(curr => false)
        if (allRoundsFinished) navigate("/endGame")
        else socket.emit("startNextRound")
    }

    const leaderboardNavigationHandler = () => {
        setStopShowingRace(true)
    }

    useEffect(() => {
        if (stopShowingRace)
            navigate("/Leaderboard")
    }, [stopShowingRace])    

    const updateExerciseHandler = (exerciseData: Exercise) => {
        const updateData = {
            url: exerciseData.url,
            name: exerciseData.name,
            difficulty: exerciseData.difficulty,
            numOfAttempts: exerciseData.numOfAttempts
        }
        socket.emit("updateExercise", exerciseData.exerciseId, updateData)
    }

    const updateTopicHandler = (topicData: Topic) => {
        const exerciseData = topicData.exercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            updateData: {url: exercise.url, difficulty: exercise.difficulty, numOfAttempts: exercise.numOfAttempts, name: exercise.name},
            isMandatory: exercise.isMandatory
        }))
        const studyIds = topicData.studies.map(study => study._id)

        socket.emit("updateTopic", topicData._id, topicData.name, exerciseData, studyIds)
    }

    function onGetUpdatedExercise(updatedExercise: Exercise) {
        const updatedExercises = allExercises.map(exercise => {
            if (exercise.exerciseId === updatedExercise.exerciseId) {
                return updatedExercise
            }
            return exercise
        })

        if (allExercises.some(exercise => exercise.exerciseId === updatedExercise.exerciseId)) {
            setAllExercises([...updatedExercises])
        } else {
            setAllExercises([...allExercises, updatedExercise])
        }

        const updatedTopicsWithExercise = allTopics.map(topic => {
            if (topic.exercises.some(exercise => exercise.exerciseId === updatedExercise.exerciseId)) {
                const updatedExercises = topic.exercises.map(exercise => {
                    if (exercise.exerciseId === updatedExercise.exerciseId) {
                        return {...updatedExercise, isMandatory: exercise.isMandatory}
                    }
                    return exercise
                })
                return { ...topic, exercises: updatedExercises }
            }
            return topic
        })

        setAllTopics([...updatedTopicsWithExercise])
    }

    function onGetUpdatedTopic(updatedTopic: Topic) {
        const updatedTopics = allTopics.map(topic => {
            if (topic._id === updatedTopic._id) {
                return updatedTopic
            }
            return topic
        })
        if (allTopics.some(topic => topic._id === updatedTopic._id)) {
            setAllTopics([...updatedTopics])
        } else {
            setAllTopics([...allTopics, updatedTopic])
        }
    }

    useEffect(() => {
        socket.on("updated-exercise", onGetUpdatedExercise)
        socket.on("updated-topic", onGetUpdatedTopic)
    }, [allExercises, allTopics])

    useEffect(() => {
        function onGhostTeamsReceived(data: ServerGhost[]) {
            const intializedGhosts: Ghost[] = initializeFrontendGhostObjects(data)
            setGhostTeams((curr) => [...intializedGhosts])
        }

        function onRoundStarted(roundDuration: number) {
            initializeRoundValues(roundDuration)
        }

        function onRoundDuration(roundDuration: number) {
            socket.emit("getGhostTeams")
            socket.emit("getRaceTrackEndScore")
            socket.emit("getInformation")
            initializeRoundValues(roundDuration)
        }

        function onThemeChange(theme: string) {
            setTheme(curr => theme)
        }

        function onFullLapScoreValue(score: number) {
            setFullLapScoreValue(curr => score)
        }

        function onScoreUpdate(stats: {score: number, accuracy: number, averageTeamScore: number}) {
            setCurrentScore((current) =>
                current < stats.score ? stats.score : current
            )
            setAverageTeamScore(curr => curr < stats.averageTeamScore ? stats.averageTeamScore : curr)
            setCurrentAccuracy(curr => stats.accuracy)
        }

        function onRaceStarted() {
            socket.emit("getNewQuestion")
            socket.emit("getMandatoryNum")
            gameStartHandler()
        }

        function onGameEnded() {
            setAllRoundsFinished(curr => true)
        }

        function onGetNewQuestion(newQuestion: IQuestion) {
            setCurrentQuestion(newQuestion)
            setCurrentQuestionNumber(curr => curr + 1)
        }

        function onGetNewGraspleQuestion(newGraspleQuestion: GraspleExercise) {
            setCurrentGraspleQuestion(newGraspleQuestion)
            setCurrentQuestionNumber(curr => curr + 1)
        }

        function onGetNumberOfMandatoryQuestions(num: number) {
            setNumberOfMandatoryQuestions(curr => num)
        }

        function onRoundInformation(roundInformation: RoundInformation) {
            setTheme(roundInformation.theme)
            setTeamName(roundInformation.teamName)
            setTopic(roundInformation.topic)
            setStudy(roundInformation.study)
        }

        function onCurrentStreaks(new_streaks: Streak[]) {
            setStreaks(curr => [...new_streaks])
        }

        function onAccessGranted(hasBeenGranted: boolean) {
            if (hasBeenGranted) {
                setLoggedIn(true)
            } else {
                setLoggedIn(false)
            }
        }

        function onGetAllStudies(allStudies: Study[]) {
            setAllStudies(curr => [...allStudies])
        }

        function onGetAllTopics(allTopics: Topic[]) {
            setAllTopics(curr => [...allTopics])
        }

        function onGetAllExercises(allExercises: Exercise[]) {
            setAllExercises(curr => [...allExercises])
        }

        function onGetLobbyData(lobbyData: LobbyData) {
            setLobbyData({...lobbyData})
        }

        function onDisableDifficulty(difficulty: string) {
            setDifficultyAvailability(curr => {
                switch(difficulty) {
                    case "easy":
                        return { ...curr, easy: false }
                    case "medium":
                        return { ...curr, medium: false }
                    case "hard":
                        return { ...curr, hard: false }
                    default:
                        return curr
                }
            })
        }

        function onAnsweredAllQuestions() {
            setDifficultyAvailability(curr => ({ easy: true, medium: true, hard: true }))
        }

        socket.on("round-duration", onRoundDuration)
        socket.on("ghost-teams", onGhostTeamsReceived)
        socket.on("round-started", onRoundStarted)
        socket.on("race-started", onRaceStarted)
        // socket.on("round-ended", onRoundEnded)
        socket.on("themeChange", onThemeChange)
        socket.on("race-track-end-score", onFullLapScoreValue)
        socket.on("score", onScoreUpdate)
        socket.on("game-ended", onGameEnded)
        socket.on("get-next-question", onGetNewQuestion)
        socket.on("get-next-grasple-question", onGetNewGraspleQuestion)
        socket.on("mandatoryNum", onGetNumberOfMandatoryQuestions)
        socket.on("round-information", onRoundInformation)
        socket.on("currentStreaks", onCurrentStreaks)
        socket.on("access-granted", onAccessGranted)
        socket.on("all-studies", onGetAllStudies)
        socket.on("all-topics", onGetAllTopics)
        socket.on("all-exercises", onGetAllExercises)
        socket.on("updated-exercise", onGetUpdatedExercise)
        socket.on("updated-topic", onGetUpdatedTopic)
        socket.on("lobby-data", onGetLobbyData)
        socket.on("disable-difficulty", onDisableDifficulty)
        socket.on("answered-all-questions", onAnsweredAllQuestions)
    }, [])

    // useEffect(() => {
    //     if (timeUsed < roundDuration) {
    //         const currentTime = new Date()
    //         const timeDifference = endOfRound.getTime() - currentTime.getTime()
    //         const remainingTime = Math.floor(timeDifference / 1000)

    //         const newTimeUsed = roundDuration - remainingTime
    //         console.log(newTimeUsed)
    //         setTimeUsed(curr => newTimeUsed)
    //     } else if (roundDuration > 0) {
    //         if (!isPlayer) socket.emit("endRound")
    //         console.log(timeUsed)
    //         console.log(roundDuration)
    //         navigate("/Leaderboard")
    //     }
    // }, [timeUsed, endOfRound])

    useEffect(() => {
        // Saves the current team score every 30 seconds, later interpolated to simulate this team's performance
        // in other team's games in the form of a ghost
        if (!isPlayer && totalSeconds % 30 == 0) {
            socket.emit("saveTimeScore")
        } 
    }, [totalSeconds])

    useEffect(() => {
        if (loggedIn) {
            socket.emit("getAllTopics")
            socket.emit("getAllStudies")	
            socket.emit("getAllExercises")
            navigate("/LecturerPlatform")
            setLoggedIn(false)
        }
    }, [loggedIn])

    return (
        <div className="App">
            <ReactNotifications/>
            <Routes>
                <Route path="/" element={<Home loggedIn={loggedIn}/>}></Route>
                <Route
                    path="/CreateGame"
                    element={
                        <CreateGame
                            onLobbyIdCreated={(id: number) => {
                                    lobbyIdHandler(id)
                                    isPlayerHandler(false)
                            }
                            }
                        />
                    }
                ></Route>
                <Route 
                    path="/JoinGame" 
                    element={<JoinGame
                        onLobbyJoined={(id: number) => {
                                lobbyIdHandler(id)
                                isPlayerHandler(true)
                            }
                        } />}>
                </Route>
                <Route
                    path="/Lobby"
                    element={
                        <LobbyDataContext.Provider value={lobbyData}>
                            <Lobby
                                lobbyId={lobbyId}
                                onTeamNameCreated={(name: string) =>
                                    teamNameHandler(name)
                                }
                                onThemeSelected={(theme: string) =>
                                    themeHandler(theme)
                                }
                                onStudySelected={(study: string) => 
                                    setStudy(curr => study)
                                }
                            />
                        </LobbyDataContext.Provider>
                    }
                ></Route>
                <Route
                    path="/Waiting"
                    element={<Waiting theme={theme} lobbyId={lobbyId} 
                    />}
                ></Route>
                <Route 
                    path="/TeamPreview" 
                    element={<TeamPreview 
                            	theme={theme} 
                                topic={topic} 
                                ghostTeams={ghostTeams}
                                mainTeamName={teamName}
                                onStartGame={() => {
                                    if (!isPlayer)  {
                                        socket.emit("beginRace")
                                        gameStartHandler()
                                }}
                                }></TeamPreview>
                        }>
                </Route>
                <Route
                    path="/Login"
                    element={
                        <Login
                            onLobbyIdCreated={(id: number) =>
                                lobbyIdHandler(id)
                            }
                        />
                    }
                ></Route>
                <Route path="/Game" element={
                    <TimeContext.Provider value={totalSeconds}>
                        <RaceDataContext.Provider value={{
                            theme: theme,
                            ghostTeams: ghostTeams,
                            checkpoints: [],
                            selectedMap: trainMaps[0]
                        }}>
                            <DifficultyAvailabilityContext.Provider value={difficultyAvailability}>
                                <ScoreContext.Provider value={{currentPoints: currentScore, totalPoints: fullLapScoreValue, teamAveragePoints: averageTeamScore, currentAccuracy: currentAccuracy}}>
                                    <QuestionContext.Provider value={{iQuestion: currentQuestion, questionNumber: currentQuestionNumber, numberOfMandatory: numberOfMandatoryQuestions}}>
                                        <GraspleQuestionContext.Provider value={{questionData: currentGraspleQuestion, questionNumber: currentQuestionNumber, numberOfMandatory: numberOfMandatoryQuestions}}>
                                            <StreakContext.Provider value={streaks}>
                                                <RaceProgressContext.Provider value={stopShowingRace}>
                                                    <Game theme={theme} roundDuration={roundDuration} roundStarted={roundstarted} isFirstRound={isFirstRound} onRoundEnded={leaderboardNavigationHandler}/>
                                                </RaceProgressContext.Provider>
                                            </StreakContext.Provider>
                                        </GraspleQuestionContext.Provider>
                                    </QuestionContext.Provider>
                                </ScoreContext.Provider>
                            </DifficultyAvailabilityContext.Provider>
                        </RaceDataContext.Provider>
                    </TimeContext.Provider>
                } />
                <Route
                    path="/Lecturer"
                    element={
                        <TimeContext.Provider value={totalSeconds}>
                            <RaceDataContext.Provider value={{
                            theme: theme,
                            ghostTeams: ghostTeams,
                            checkpoints: [],
                            selectedMap: trainMaps[0]
                            }}>
                                <ScoreContext.Provider value={{currentPoints: currentScore, totalPoints: fullLapScoreValue, teamAveragePoints: averageTeamScore, currentAccuracy: currentAccuracy}}>
                                   <RaceProgressContext.Provider value={stopShowingRace}>
                                    <Lecturer
                                            lobbyId={lobbyId}
                                            teamName={teamName}
                                            ghostTeams={ghostTeams}
                                            theme={theme}
                                            roundDuration={roundDuration}
                                        />
                                   </RaceProgressContext.Provider>
                                </ScoreContext.Provider>
                            </RaceDataContext.Provider>
                        </TimeContext.Provider>
                    }
                ></Route>
                <Route
                    path="/Leaderboard"
                    element={
                        <Leaderboard
                            ghosts={ghostTeams}
                            teamname={teamName}
                            teamScore={currentScore}
                            teamStudy={study}
                            lapsCompleted={Math.floor(currentScore / fullLapScoreValue)}
                            isLecturer={!isPlayer}
                            isLastRound={allRoundsFinished}
                        />
                    }
                ></Route>
                <Route
                    path="/LecturerPlatform"
                    element={
                        <TopicDataContext.Provider value={{allStudies: allStudies, allExercises: allExercises, allTopics: allTopics}}>
                            <LecturerPlatform 
                                loggedIn={loggedIn} 
                                onUpdateExercise={(exerciseData: Exercise) => updateExerciseHandler(exerciseData)}
                                onUpdateTopic={(topicData: Topic) => updateTopicHandler(topicData)}
                                />
                        </TopicDataContext.Provider>
                    }
                ></Route>
                <Route path="/endGame" element={<EndGameScreen />}></Route>
                <Route path="/Statistics" element={<QuestionStatistics onContinue={() => nextRoundHandler()}/>}></Route>
            </Routes>
        </div>
    )
}

export default App
