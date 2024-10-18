import { Accordion, AccordionDetails, AccordionSummary, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, ToggleButton, AccordionActions, TextField} from "@mui/material";
import "./TopicElement.css";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import StudyEdit from "./StudyEdit/StudyEdit";
import ExerciseElement from "../ExerciseElement/ExerciseElement";
import { Store } from 'react-notifications-component';
import { Tooltip } from "react-tooltip";

interface Exercise {
    id: number,
    name: string,
    grasple_id: number,
    difficuly: string,
    url: string,
    numOfAttempts: number   
}

interface ExerciseListElement {
    exercise: Exercise,
    incompleteExercise: boolean
}

interface Props {
    id: number,
    name: string,
    studies: string[],
    exercises: Exercise[]
    onUpdateTopic: (topicData: Topic) => void
    discardNewTopic: () => void
}

interface Topic {
    id: number,
    name: string,
    studies: string[],
    exercises: Exercise[]
}

function TopicElement(props: Props) {
    const [changingStudies, setChangingStudies] = useState<boolean>(false);
    const [editingExerciseIndex, setEditingExerciseIndex] = useState<number>(-1);
    const [exercisesMode, setExercisesMode] = useState<string>("");
    const [saveChanges, setSaveChanges] = useState<string>("");
    const [exercises, setExercises] = useState<ExerciseListElement[]>(props.exercises.map(exercise => ({exercise, incompleteExercise: false})));
    const [editName, setEditName] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>("");
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<number>(-1);
    const [newTopicData, setNewTopicData] = useState<Topic>({
        id: props.id,
        name: props.name,
        studies: props.studies,
        exercises: props.exercises
    });

    const [studies, setStudies] = useState<string[]>(props.studies);

    const studiesChangedHandler = (newStudies: string[]) => {
        setStudies(curr => [...newStudies])
        setChangingStudies(curr => false)
        setSaveChanges(curr => "studies")
    }

    const editingExerciseHandler = (index: number) => {
        if (editingExerciseIndex > -1) {
            Store.addNotification({
                title: "Warning",
                message: "You must save changes before editing a different exercise",
                type: "warning",
                insert: "top",
                container: "bottom-right",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
        } else {
            setEditingExerciseIndex(curr => index)
        }
    }

    const exerciseFinishEditingHandler = (exerciseData: Exercise) => {
        const newExercises = exercises.map((exercise, idx) => idx === editingExerciseIndex ? {exercise: exerciseData, incompleteExercise: false} : exercise)
        setExercises(curr => [...newExercises])
        setEditingExerciseIndex(-1)
    }

    const addNewExerciseHandler = () => {
        const newExercise: ExerciseListElement = {
            exercise:{
                id: -1,
                name: "",
                grasple_id: 0,
                difficuly: "Easy",
                url: "",
                numOfAttempts: 0,
            },
            incompleteExercise: true
        }
        const newExercises = [newExercise, ...exercises];
        setExercises(curr => [...newExercises]);
        setEditingExerciseIndex(0);
    }

    const handleDeleteExercise = (index: number) => {
        setExerciseToDelete(index);
        setOpenDialog(true);
    };

    const confirmDeleteExercise = () => {
        if (exerciseToDelete > -1) {
            const newExercises = exercises.filter((_, idx) => idx !== exerciseToDelete);
            setExercises(newExercises);
            setExerciseToDelete(-1);
        }
        setOpenDialog(false);
    };

    const cancelDeleteExercise = () => {
        setExerciseToDelete(-1);
        setOpenDialog(false);
    };

    const removingExercisesHandler = () => {
        setExercisesMode("remove");
    }

    const editingExercisesHandler = () => {
        setExercisesMode("edit");
    }

    const discardEditingExerciseHandler = () => {
        setEditingExerciseIndex(-1);
        setExercises(curr => [...curr.filter((exercise, index) => exercise.incompleteExercise === false)]);
    }

    function saveNameHandler(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        setSaveChanges(curr => "name");
    }

    useEffect(() => {
        if (saveChanges === "name" && editName) {
            if (newName == "" || newName == "New Name") {
                Store.addNotification({
                    title: "Warning",
                    message: "You should set an appropriate name for the topic",
                    type: "warning",
                    insert: "top",
                    container: "bottom-right",
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                })
            } else {
                setNewTopicData(curr => ({...curr, name: newName}));
                setEditName(curr => false);
                setSaveChanges(curr => "");
            }
        } 
        
        else if (saveChanges === "studies" && changingStudies) {
            setNewTopicData(curr => ({...curr, studies: studies}));
            setChangingStudies(curr => false);
            setSaveChanges(curr => "");
        } 
        
        else if (saveChanges === "exercises" && exercisesMode != "") {
            setNewTopicData(curr => ({...curr, exercises: exercises.map(exercise => exercise.exercise)}));
            setExercisesMode(curr => "");
            setSaveChanges(curr => "");
        }
    }, [saveChanges, newName, exercisesMode])

    useEffect(() => {
        if (newTopicData.name === "") {
            Store.addNotification({
                title: "Warning",
                message: "The topic name cannot be empty",
                type: "warning",
                insert: "top",
                container: "bottom-right",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
        } else if (newTopicData.studies.length === 0) {
            Store.addNotification({
                title: "Warning",
                message: "The topic must have at least one study",
                type: "warning",
                insert: "top",
                container: "bottom-right",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
        } else if (newTopicData.exercises.length === 0) {
            Store.addNotification({
                title: "Warning",
                message: "The topic must have at least one exercise",
                type: "warning",
                insert: "top",
                container: "bottom-right",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            });
        } else {
            props.onUpdateTopic(newTopicData);
        }
    }, [newTopicData])

    function discardExerciseChangesHandler(): void {
        setExercisesMode("");
        setSaveChanges("");
        setExercises(curr => [...newTopicData.exercises.map(exercise => ({exercise, incompleteExercise: false}))]);
    }

    function saveExercisesHandler(): void {
        setSaveChanges(curr => "exercises");
    }

    return (
        <div className="topic-element">
            <Accordion sx={{ backgroundColor: '#f5f5f5' }}>
                <AccordionSummary
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ height: '5remis' }}
                >
                    <div>
                        <div className="topic-title">
                            {props.name}
                        </div>
                        <div className="number-of-exercises">Exercises: {props.exercises.length}</div>
                    </div>
                </AccordionSummary>
                <Divider/>
                <AccordionDetails>
                    <div className="name-section">
                        {!editName ? (
                            <>
                                <div className="name-header topic-header">
                                    Name
                                    <FontAwesomeIcon icon={faPen} size="xs" className="edit-name-icon" style={{marginLeft: "0.5rem"}} onClick={() => setEditName(true)} />
                                </div>
                                <div>
                                    {props.name} 
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="name-header topic-header">
                                    Name
                                </div>
                                <div>
                                    <TextField 
                                        defaultValue={props.name} 
                                        onChange={(e) => setNewName(e.target.value)} 
                                        variant="outlined" 
                                        size="small" 
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </AccordionDetails>
                {editName && (
                    <AccordionActions>
                        <Button size="small" onClick={() => setEditName(false)}>Discard</Button>
                        <Button size="small" onClick={saveNameHandler} variant="contained">Save</Button>
                    </AccordionActions>
                )}
                <Divider/>
                <AccordionDetails>
                    <div className="studies-section d-flex align-items-center">
                        {!changingStudies ? (
                            <div>
                                <div className="studies-header topic-header">
                                Studies <FontAwesomeIcon icon={faPen} size="xs" className="edit-studies-icon" onClick={() => setChangingStudies(curr => true)}/>
                                </div>
                                <div className="studies-list">
                                    {studies.map((study, index) => (
                                        <div key={index} className="study-element">
                                            {study}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <StudyEdit studies={studies} allStudies={["Study 1", "Study 2", "Study 3", "Study 4"]} onStudiesSelected={studiesChangedHandler} saveChanges={saveChanges === "studies"}></StudyEdit>
                        )}
                    </div>
                </AccordionDetails>
                {changingStudies && (<AccordionActions>
                    <Button size="small" onClick={() => setChangingStudies(false)}>Discard</Button>
                    <Button size="small" onClick={() => setSaveChanges(curr => "studies")} variant="contained">Save</Button>
                </AccordionActions>)}
                <Divider/>
                <AccordionDetails>
                    <div className="exercises-section">
                        <div className="exercises-header topic-header" style={{marginBottom: "0.5rem"}}>
                            Exercises 
                            {exercisesMode != "" ? (
                                <>
                                <Tooltip id="info-tooltip" place="top" style={{zIndex: "9999"}}>
                                </Tooltip>
                                <FontAwesomeIcon
                                    icon={faCircleInfo}
                                    style={{ color: "#1976D2", marginLeft: "0.5rem" }}
                                    data-tooltip-id="info-tooltip"
                                    data-tooltip-place="right"
                                    data-tooltip-html="Add new exercises by pressing the + button.<br />Toggle between remove and edit modes by pressing the trash can toggle.<br />Edit/remove individual exercises based on the selected mode."
                                />
                                <FontAwesomeIcon icon={faPlus} className="add-exercise-icon" onClick={() => addNewExerciseHandler()}/>
                                <ToggleButton
                                    value="check"
                                    selected={exercisesMode == "remove"}
                                    onChange={() => setExercisesMode(exercisesMode === "edit" ? "remove" : "edit")}
                                    sx={{marginLeft: "1rem"}}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </ToggleButton>
                                </>
                            ) : (
                                <FontAwesomeIcon icon={faPen} size="xs" className="edit-studies-icon" onClick={() => setExercisesMode(curr => "edit")}/>
                            )}
                        </div>
                        <div className="exercises-list">
                            {exercises.map((exerciseElement, index) => (
                                <div className="d-flex row" key={index}>
                                    <ExerciseElement 
                                        id={exerciseElement.exercise.id} 
                                        name={exerciseElement.exercise.name} 
                                        grasple_id={exerciseElement.exercise.grasple_id} 
                                        difficuly={exerciseElement.exercise.difficuly} 
                                        url={exerciseElement.exercise.url} 
                                        numOfAttempts={exerciseElement.exercise.numOfAttempts}
                                        beingEdited={editingExerciseIndex == index}
                                        closeNotEditing={editingExerciseIndex > -1}
                                        onFinishEditingExercise={(exerciseData: Exercise) => exerciseFinishEditingHandler(exerciseData)}
                                        onDiscardEditingExercise={() => discardEditingExerciseHandler()}
                                    ></ExerciseElement>
                                    {exercisesMode == "edit" ? (
                                        <FontAwesomeIcon icon={faPen} size="sm" className="exercise-edit-icon d-flex col m-auto" onClick={() => editingExerciseHandler(index)}/>
                                    ) : exercisesMode == "remove" ? (
                                        <FontAwesomeIcon icon={faTrash} size="sm" className="exercise-remove-icon d-flex col m-auto" onClick={() => handleDeleteExercise(index)}/>
                                    ) : null}	
                                </div>
                            ))}
                        </div>
                    </div>
                </AccordionDetails>
                {exercisesMode != "" && (<AccordionActions>
                    <Button size="small" onClick={() => discardExerciseChangesHandler()}>Discard</Button>
                    <Button size="small" onClick={() => saveExercisesHandler()} variant="contained">Save</Button>
                </AccordionActions>)}
            </Accordion>
            <Dialog open={openDialog} onClose={cancelDeleteExercise}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete the exercise {exercises[exerciseToDelete]?.exercise.name} (#{exercises[exerciseToDelete]?.exercise.grasple_id})?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cancelDeleteExercise} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={confirmDeleteExercise} color="primary">
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
        </div>
    );
}

export default TopicElement