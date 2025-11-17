import React, { useContext, useState } from "react"
import "./Steps.css"
import Step from "./Step/Step"
import Themes from "../Themes/Themes"
import Studies from "../Studies/Studies"
import Rounds from "../Rounds/Rounds"
import StartGame from "../StartGame/StartGame"
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer, toast } from "react-toastify"
import { host } from "../../../../utils/APIRoutes"
import socket from "../../../../socket"
import SelectName from "../SelectName/SelectName"
import { LobbyDataContext } from "../../../../contexts/LobbyDataContext"

interface SelectedRound {
    topicName: string,
    roundDuration: number
}

interface Props {
    lobbyId: number // id of the lobby
    playerNumber: number // number of players in the lobby
    onNameSelected: (name: string) => void // event called when a name is chosen
    startGameHandler: (
        selectedRounds: SelectedRound[],
        selectedStudy: string,
        selectedTheme: string
    ) => void // event called when start game button is clicked
    onAllowIndividualPlacementsChange: (value: boolean) => void // event called when allow individual placements is changed
}

function Steps(props: Props) {
    const [activeStep, setActiveStep] = useState(1)
    const [completedSteps, setCompletedSteps] = useState([
        false,
        false,
        false,
        false,
        false,
    ])

    const [selectedTheme, setSelectedTheme] = useState("")
    const [selectedStudy, setSelectedStudy] = useState("")
    const [selectedRounds, setSelectedRounds] = useState<SelectedRound[]>([])

    const lobbyData = useContext(LobbyDataContext)

    /**
     * Function called when a step has been selected on the lobby screen
     * @param stepNumber    // the number of the step that was selected
     */
    const stepSelectedHandler = (stepNumber: number) => {
        if (stepNumber == 4 && !completedSteps[2]) {
            setActiveStep(3)
            toast.warn("You have to select a study before selecting rounds.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            })
        } else setActiveStep(stepNumber)
    }

    /**
     * Function called when a step's completion status has been changed
     * @param stepNumber    // the number of the step that was changed
     * @param completed     // boolean indicating whether the step was completed or uncompleted
     */
    const stepCompletionHandler = (stepNumber: number, completed: boolean) => {
        const temp = completedSteps
        temp[stepNumber - 1] = completed
        setCompletedSteps(temp)
    }

    /**
     * Function that makes an api call to get available rounds based on the selected study
     * @param study     // the study for which the rounds are queried
     */
    const getRoundsByStudy = async (study: string) => {
        const url =
            `${host}/api/lobby/getRounds/${study.toUpperCase()}`
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "skip-browser-warning"
            },
        })
        const rounds = await res.json()
    }

    const topicsFilterHandler = (filter: boolean) => {
        if (filter) {
            socket.emit("getLobbyData", selectedStudy)
        } else {
            socket.emit("getLobbyData")
        }
    }

    return (
        <div className="stepper">
            {/* FIRST STEP; NAME CREATION */}
            <Step
                stepNumber={1}
                onStepSelected={stepSelectedHandler}
                stepTitle="Select a name"
                stepCaption="A team name makes you unique!"
                stepContent={
                    <SelectName
                        teamNameSelected={(name: string) =>
                            props.onNameSelected(name)
                        }
                        onStepCompleted={() => {
                            stepCompletionHandler(1, true)
                            setActiveStep(2)
                        }}
                    />
                }
                stepActive={activeStep == 1 ? true : false}
                stepCompleted={completedSteps[0] ? true : false}
            ></Step>

            {/* SECOND STEP; THEME SELECTION */}
            <Step
                stepNumber={2}
                onStepSelected={stepSelectedHandler}
                stepTitle="Select a theme"
                stepCaption="A theme determines the visuals for your race."
                stepContent={
                    <Themes
                        onSelectTheme={(theme: string) => {
                            setSelectedTheme(theme)
                            socket.emit("themeSelected", theme)
                            setActiveStep(3)
                        }}
                        onStepCompleted={() => stepCompletionHandler(2, true)}
                    ></Themes>
                }
                stepActive={activeStep == 2 ? true : false}
                stepCompleted={completedSteps[1] ? true : false}
            ></Step>

            {/* THIRD STEP; STUDY SELECTION */}
            <Step
                stepNumber={3}
                onStepSelected={stepSelectedHandler}
                stepTitle="Select a study programme"
                stepCaption="A study programme allows you to filter the available topics to only include those made with your program in mind."
                stepContent={
                    <Studies
                        onSelectStudy={(study: string) => {
                            setSelectedStudy(study)
                            getRoundsByStudy(study)
                            setActiveStep(4)
                        }}
                        onStepCompleted={() => stepCompletionHandler(3, true)}
                        availableStudies={lobbyData.studies}
                    ></Studies>
                }
                stepActive={activeStep == 3 ? true : false}
                stepCompleted={completedSteps[2] ? true : false}
            ></Step>

            {/* FOURTH STEP; ROUND SELECTION */}
            <Step
                stepNumber={4}
                onStepSelected={stepSelectedHandler}
                stepTitle="Select topics"
                stepCaption="Each topic will be a seperate round in the race."
                stepContent={
                    <Rounds
                        onRoundSelected={(rounds: SelectedRound[]) => {
                            setSelectedRounds(curr => [...rounds])
                        }}
                        onStepCompleted={(completed: boolean) =>
                            stepCompletionHandler(4, completed)
                        }
                        availableRounds={lobbyData.topics}
                        onFilterByStudyProgramme={(filter: boolean) => topicsFilterHandler(filter)}
                    ></Rounds>
                }
                stepActive={activeStep == 4 ? true : false}
                stepCompleted={completedSteps[3] ? true : false}
            ></Step>

            {/* FIFTH STEP; START GAME */}
            <Step
                stepNumber={5}
                onStepSelected={stepSelectedHandler}
                stepTitle="Start!"
                stepCaption="Begin the race."
                stepContent={
                    <StartGame
                        completedSteps={completedSteps}
                        selectedTheme={selectedTheme}
                        selectedStudy={selectedStudy}
                        selectedRounds={selectedRounds.map(x => x.topicName)}
                        playerNumber={props.playerNumber}
                        allowIndividualPlacements={props.onAllowIndividualPlacementsChange}
                        onStartGame={() =>
                            props.startGameHandler(
                                selectedRounds,
                                selectedStudy,
                                selectedTheme
                            )
                        }
                    ></StartGame>
                }
                stepActive={activeStep == 5 ? true : false}
                stepCompleted={completedSteps[4] ? true : false}
            ></Step>
            <ToastContainer />
        </div>
    )
}

export default Steps
