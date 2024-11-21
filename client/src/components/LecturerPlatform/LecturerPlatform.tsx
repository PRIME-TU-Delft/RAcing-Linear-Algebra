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
import { faHome, faSearch } from '@fortawesome/free-solid-svg-icons'
import TopicElement from "./TopicElement/TopicElement"
import { Button, InputAdornment, TextField } from "@mui/material"
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
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
    const [paginatedExercises, setPaginatedExercises] = useState<Exercise[]>([])

    const [exerciseGraspleIds, setExerciseGraspleIds] = useState<number[]>([])
    const [topics, setTopics] = useState<Topic[]>([])
    const [filteredTopics, setFilteredTopics] = useState<Topic[]>([])
    const [paginatedTopics, setPaginatedTopics] = useState<Topic[]>([])

    const [currentExercisePage, setCurrentExercisePage] = useState<number>(1)
    const exercisesPerPage = 15
    const [currentTopicPage, setCurrentTopicPage] = useState<number>(1)
    const topicsPerPage = 10

    const [topicSearchQuery, setTopicSearchQuery] = useState<string>("");
    const [exerciseSearchQuery, setExerciseSearchQuery] = useState<string>("");

    const handleTopicSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTopicSearchQuery(event.target.value);
    }

    const handleExerciseSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setExerciseSearchQuery(event.target.value);
    };

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

    const updateTopicHandler = (topicData: Topic, topicId: string) => {
        props.onUpdateTopic(topicData)
    }

    function discardNewTopicHandler(topicId: string): void {
        const newTopics = [...topics]
        const index = newTopics.findIndex(topic => topic._id === topicId);
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

    const discardNewExerciseHandler = (exerciseId: number, deleteExercise: boolean) => {
        if (deleteExercise) {
            const newExercises = exercises.filter((exercise) => exercise.exerciseId !== exerciseId)
            setExercises(curr => [...newExercises])
            return
        }
    }

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue)
    }

    const addExerciseToTopic = (topicId: string, exercise: Exercise) => {
        const newTopics = topics.map((topic) => {
            if (topic._id === topicId) {
                const exerciseExists = topic.exercises.some(ex => ex.exerciseId === exercise.exerciseId)
                if (!exerciseExists) {
                    return { ...topic, exercises: [exercise, ...topic.exercises] }
                }
            }
            return topic
        })
        setTopics(curr => [...newTopics])
    }

    const linkExerciseHandler = (topicId: string, exerciseGraspleId: number) => {
        const exercise = exercises.find(exercise => exercise.exerciseId === exerciseGraspleId)
        if (exercise) {
            addExerciseToTopic(topicId, exercise)
        }
    }

    const handleExercisePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentExercisePage(value)
    }

    const handleTopicPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentTopicPage(value)
    }

    useEffect(() => {
        setFilteredExercises(exercises.filter(exercise => exercise.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase())))
    }, [exercises, exerciseSearchQuery])

    useEffect(() => {
        setFilteredTopics(topics.filter(topic => topic.name.toLowerCase().includes(topicSearchQuery.toLowerCase())))
    }, [topics, topicSearchQuery])

    useEffect(() => {
        setPaginatedExercises(curr => [...filteredExercises.slice((currentExercisePage - 1) * exercisesPerPage, currentExercisePage * exercisesPerPage)])
    }, [filteredExercises, currentExercisePage, exercisesPerPage])

    useEffect(() => {
        setPaginatedTopics(curr => [...filteredTopics.slice((currentTopicPage - 1) * topicsPerPage, currentTopicPage * topicsPerPage)])
    }, [filteredTopics, currentTopicPage, topicsPerPage])

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
                        <div className="topics-controls-container d-flex align-content-center">
                            <Button variant="outlined" color="secondary" onClick={createNewTopic} sx={{ alignSelf: 'flex-start', height: '3rem', width: '15rem' }}>Create New Topic</Button>
                            <TextField
                                variant="outlined"
                                placeholder="Search topics"
                                value={topicSearchQuery}
                                onChange={handleTopicSearchChange}
                                sx={{ marginLeft: 2, height: '3rem', width: ' 100%' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FontAwesomeIcon icon={faSearch} />
                                        </InputAdornment>
                                    ),
                                    style: { height: '3rem' }
                                }}
                            />
                        </div>
                        <div>
                            {paginatedTopics.map((topic, index) => (
                                <TopicElement 
                                    key={index} 
                                    _id={topic._id} 
                                    name={topic.name} 
                                    studies={topic.studies} 
                                    exercises={topic.exercises} 
                                    onUpdateTopic={(topicData: Topic) => updateTopicHandler(topicData, topic._id)}
                                    discardNewTopic={() => discardNewTopicHandler(topic._id)}
                                    availableGraspleIds={exerciseGraspleIds}
                                    onLinkExercise={(graspleId: number) => linkExerciseHandler(topic._id, graspleId)}
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
                        <div className="exercises-controls-container d-flex align-content-center">
                            <Button variant="outlined" color="secondary" onClick={createNewExercise} sx={{ alignSelf: 'flex-start', height: '3rem', width: '15rem' }}>Create New Exercise</Button>
                            <TextField
                                variant="outlined"
                                placeholder="Search exercises"
                                value={exerciseSearchQuery}
                                onChange={handleExerciseSearchChange}
                                sx={{ marginLeft: 2, height: '3rem', width: ' 100%' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FontAwesomeIcon icon={faSearch} />
                                        </InputAdornment>
                                    ),
                                    style: { height: '3rem' }
                                }}
                            /> 
                        </div>
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
                                    onDiscardEditingExercise={(deleteExercise: boolean) => discardNewExerciseHandler(exercise.exerciseId, deleteExercise)}
                                    onExerciseAlreadyExists={() => {}}
                                    isIndependentElement={true}
                                    isMandatory={false}
                                />
                            ))}
                        </div>
                        {exercises.length > exercisesPerPage && (
                            <Pagination 
                                count={Math.ceil(exercises.length / exercisesPerPage)} 
                                page={currentExercisePage} 
                                onChange={handleExercisePageChange} 
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