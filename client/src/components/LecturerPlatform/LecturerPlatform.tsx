import React, { useContext, useEffect, useState } from "react";
import "./LecturerPlatform.css";
import { useNavigate } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import TopicElement from "./TopicElement/TopicElement";
import { Button } from "@mui/material";
import ExerciseElement from "./ExerciseElement/ExerciseElement";
import { Exercise, Study, Topic } from "./SharedUtils";
import { TopicDataContext } from "../../contexts/TopicDataContext";

interface Props {
    loggedIn: boolean
}

function LecturerPlatform(props: Props) {
    const [activeTab, setActiveTab] = useState<string>("topics")

    const topicData = useContext(TopicDataContext);
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [exerciseGraspleIds, setExerciseGraspleIds] = useState<number[]>([])
    const [topics, setTopics] = useState<Topic[]>([])

    useEffect(() => {
        setExerciseGraspleIds([...exercises.map(exercise => exercise.exerciseId)])
    }, [exercises])

    const navigate = useNavigate();

    useEffect(() => {
        setTopics([...topicData.allTopics])
    }, [topicData.allTopics])

    useEffect(() => {
        setExercises([...topicData.allExercises])
    }, [topicData.allExercises]);

    useEffect(() => {
        if (!props.loggedIn) {
            // navigate("/");
        }
    }, [props.loggedIn, navigate]);

    const updateTopicHandler = (topicData: Topic, index: number) => {
        const newTopics = [...topics];
        newTopics[index] = topicData;
        setTopics(curr => [...newTopics]);
    }

    function discardNewTopicHandler(index: number): void {
        const newTopics = [...topics];
        newTopics.splice(index, 1);
        setTopics(curr => [...newTopics]);
    }

    const createNewTopic = () => {
        const newTopic = {
            _id: "",
            name: "New Topic",
            studies: [],
            exercises: []
        };
        const newTopics = [newTopic, ...topics];
        console.log(newTopics);
        setTopics(curr => [...newTopics]);
    }

    const createNewExercise = () => {
        const newExercise: Exercise = { _id: "", name: "New Exercise", exerciseId: -1, difficulty: "", url: "", numOfAttempts: 0 };
        const newExercises = [newExercise, ...exercises];
        setExercises(newExercises);
    };

    const updateExerciseHandler = (exerciseData: Exercise, index: number) => {
        const newExercises = exercises.map((exercise, idx) => idx === index ? exerciseData : exercise)
        setExercises(curr => [...newExercises])
    };

    const discardNewExerciseHandler = (index: number, deleteExercise: boolean) => {
        if (deleteExercise) {
            const newExercises = exercises.filter((exercise, idx) => idx !== index)
            setExercises(curr => [...newExercises])
            return;
        }
    };

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    const addExerciseToTopic = (topicIndex: number, exercise: Exercise) => {
        const newTopics = topics.map((topic, index) => {
            if (index === topicIndex) {
                const exerciseExists = topic.exercises.some(ex => ex.exerciseId === exercise.exerciseId);
                if (!exerciseExists) {
                    return { ...topic, exercises: [exercise, ...topic.exercises] };
                }
            }
            return topic;
        });
        setTopics(curr => [...newTopics]);
    }

    const linkExerciseHandler = (topicIndex: number, exerciseGraspleId: number) => {
        const exercise = exercises.find(exercise => exercise.exerciseId === exerciseGraspleId)
        if (exercise) {
            addExerciseToTopic(topicIndex, exercise)
        }
    }

    return (
        <div>
            <AppBar position="static">
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
            {activeTab === "topics" && (
                <>
                    <Button variant="outlined" style={{marginTop: "2rem", width: "80%"}} onClick={createNewTopic}>Create New Topic</Button>
                    <div style={{marginBottom: "1rem"}}>
                        {topics.map((topic, index) => (
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
                </>
            )}
            {activeTab === "exercises" && (
                <>
                    <Button variant="outlined" style={{marginTop: "2rem", width: "80%"}} onClick={createNewExercise}>Create New Exercise</Button>
                    <div style={{marginBottom: "1rem"}}>
                        {exercises.map((exercise, index) => (
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
                                onFinishEditingExercise={(exerciseData: Exercise) => updateExerciseHandler(exerciseData, index)}
                                onDiscardEditingExercise={(deleteExercise: boolean) => discardNewExerciseHandler(index, deleteExercise)}
                                isIndependentElement={true}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default LecturerPlatform;