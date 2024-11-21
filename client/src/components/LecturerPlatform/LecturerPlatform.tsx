import React, { useContext, useEffect, useState } from "react"
import "./LecturerPlatform.css"
import { useNavigate } from "react-router-dom"
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import IconButton from '@mui/material/IconButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import TopicElement from "./TopicElement/TopicElement"
import { Button } from "@mui/material"
import ExerciseElement from "./ExerciseElement/ExerciseElement"
import { Exercise, Study, Topic } from "./SharedUtils"
import { TopicDataContext } from "../../contexts/TopicDataContext"
import { ExistingExercisesContext } from "./ExistingExercisesContext"
import socket from "../../socket"
import Pagination from '@mui/material/Pagination'

interface Props {
    loggedIn: boolean,
    onUpdateExercise: (exerciseData: Exercise) => void
    onUpdateTopic: (topicData: Topic) => void
}

function LecturerPlatform(props: Props) {
    const [activeTab, setActiveTab] = useState<string>("topics")

    const topicData = useContext(TopicDataContext)
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [exerciseGraspleIds, setExerciseGraspleIds] = useState<number[]>([])
    const [topics, setTopics] = useState<Topic[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const exercisesPerPage = 15
    const [currentTopicPage, setCurrentTopicPage] = useState<number>(1)
    const topicsPerPage = 10

    useEffect(() => {
        setExerciseGraspleIds([...exercises.map(exercise => exercise.exerciseId)])
    }, [exercises])

    const navigate = useNavigate()

    useEffect(() => {
        setTopics([...topicData.allTopics])
    }, [topicData.allTopics])

    useEffect(() => {
        setExercises([...topicData.allExercises])
    }, [topicData.allExercises])

    useEffect(() => {
        if (!props.loggedIn) {
            // navigate("/")
        }
    }, [props.loggedIn, navigate])

    const updateTopicHandler = (topicData: Topic, index: number) => {
        props.onUpdateTopic(topicData)
    }

    function discardNewTopicHandler(index: number): void {
        const newTopics = [...topics]
        newTopics.splice(index, 1)
        setTopics(curr => [...newTopics])
    }

    const createNewTopic = () => {
        const newTopic = {
            _id: "",
            name: "",
            studies: topicData.allStudies,
            exercises: []
        }
        const newTopics = [newTopic, ...topics]
        setTopics(curr => [...newTopics])
    }

    const createNewExercise = () => {
        const newExercise: Exercise = { _id: "", name: "", exerciseId: -1, difficulty: "Easy", url: "", numOfAttempts: 1, isMandatory: false }
        const newExercises = [newExercise, ...exercises]
        setExercises(newExercises)
    }

    const updateExerciseHandler = (exerciseData: Exercise) => {
        props.onUpdateExercise(exerciseData)
    }

    const discardNewExerciseHandler = (index: number, deleteExercise: boolean) => {
        if (deleteExercise) {
            const newExercises = exercises.filter((exercise, idx) => idx !== index)
            setExercises(curr => [...newExercises])
            return
        }
    }

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue)
    }

    const addExerciseToTopic = (topicIndex: number, exercise: Exercise) => {
        const newTopics = topics.map((topic, index) => {
            if (index === topicIndex) {
                const exerciseExists = topic.exercises.some(ex => ex.exerciseId === exercise.exerciseId)
                if (!exerciseExists) {
                    return { ...topic, exercises: [exercise, ...topic.exercises] }
                }
            }
            return topic
        })
        setTopics(curr => [...newTopics])
    }

    const linkExerciseHandler = (topicIndex: number, exerciseGraspleId: number) => {
        const exercise = exercises.find(exercise => exercise.exerciseId === exerciseGraspleId)
        if (exercise) {
            addExerciseToTopic(topicIndex, exercise)
        }
    }

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value)
    }

    const handleTopicPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentTopicPage(value)
    }

    const paginatedExercises = exercises.slice((currentPage - 1) * exercisesPerPage, currentPage * exercisesPerPage)
    const paginatedTopics = topics.slice((currentTopicPage - 1) * topicsPerPage, currentTopicPage * topicsPerPage)

    return (
        <div>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        RAcing Linear Algebra
                    </Typography>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleChange}
                        textColor="inherit"
                        indicatorColor="secondary"
                        className="lecturer-platform-tabs"
                    >
                        <Tab value="topics" label="Topics"/>
                        <Tab value="exercises" label="Exercises"/>
                    </Tabs>
                    <IconButton color="inherit" onClick={() => navigate("/")} style={{marginLeft: "auto"}}>
                        <FontAwesomeIcon icon={faHome} />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <ExistingExercisesContext.Provider value={exerciseGraspleIds}>
                {activeTab === "topics" && (
                    <>
                        <Button variant="outlined" style={{marginTop: "2rem", width: "80%"}} onClick={createNewTopic}>Create New Topic</Button>
                        <div>
                            {paginatedTopics.map((topic, index) => (
                                <TopicElement 
                                    key={index} 
                                    _id={topic._id} 
                                    name={topic.name} 
                                    studies={topic.studies} 
                                    exercises={topic.exercises} 
                                    onUpdateTopic={(topicData: Topic) => updateTopicHandler(topicData, index)}
                                    discardNewTopic={() => discardNewTopicHandler(index)}
                                    availableGraspleIds={exerciseGraspleIds}
                                    onLinkExercise={(graspleId: number) => linkExerciseHandler(index, graspleId)}
                                />
                            ))}
                        </div>
                        {topics.length > topicsPerPage && (
                            <Pagination 
                                count={Math.ceil(topics.length / topicsPerPage)} 
                                page={currentTopicPage} 
                                onChange={handleTopicPageChange} 
                                style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}
                            />
                        )}
                    </>
                )}
                {activeTab === "exercises" && (
                    <>
                        <Button variant="outlined" style={{marginTop: "2rem", width: "80%"}} onClick={createNewExercise}>Create New Exercise</Button>
                        <div style={{marginBottom: "2rem"}}>
                            {paginatedExercises.map((exercise, index) => (
                                <ExerciseElement 
                                    key={index} 
                                    _id={exercise._id} 
                                    name={exercise.name} 
                                    exerciseId={exercise.exerciseId} 
                                    difficulty={exercise.difficulty} 
                                    url={exercise.url} 
                                    numOfAttempts={exercise.numOfAttempts} 
                                    beingEdited={false} 
                                    closeNotEditing={false} 
                                    parentSaveChanges={false}
                                    onFinishEditingExercise={(exerciseData: Exercise) => updateExerciseHandler(exerciseData)}
                                    onDiscardEditingExercise={(deleteExercise: boolean) => discardNewExerciseHandler(index, deleteExercise)}
                                    onExerciseAlreadyExists={() => {}}
                                    isIndependentElement={true}
                                    isMandatory={false}
                                />
                            ))}
                        </div>
                        {exercises.length > exercisesPerPage && (
                            <Pagination 
                                count={Math.ceil(exercises.length / exercisesPerPage)} 
                                page={currentPage} 
                                onChange={handlePageChange} 
                                style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}
                            />
                        )}
                    </>
                )}
            </ExistingExercisesContext.Provider>
        </div>
    )
}

export default LecturerPlatform