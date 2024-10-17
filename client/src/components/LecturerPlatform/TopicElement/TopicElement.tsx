import { Accordion, AccordionDetails, AccordionSummary, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button} from "@mui/material";
import "./TopicElement.css";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import StudyEdit from "./StudyEdit/StudyEdit";
import ExerciseElement from "../ExerciseElement/ExerciseElement";
import { Store } from 'react-notifications-component';

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

function TopicElement() {
    const [changingStudies, setChangingStudies] = useState<boolean>(false);
    const [editingExerciseIndex, setEditingExerciseIndex] = useState<number>(-1);
    const [exercisesMode, setExercisesMode] = useState<string>("edit");
    const [exercises, setExercises] = useState<ExerciseListElement[]>([
        {
            exercise: {
                id: 1,
                name: "Exercise 1",
                grasple_id: 7896,
                difficuly: "Easy",
                url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
                numOfAttempts: 1,
            },
            incompleteExercise: false
        },
        {
            exercise: {
                id: 1,
                name: "Exercise 1",
                grasple_id: 7896,
                difficuly: "Easy",
                url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
                numOfAttempts: 1,
            },
            incompleteExercise: false
        },
        {
            exercise: {
                id: 1,
                name: "Exercise 1",
                grasple_id: 7896,
                difficuly: "Easy",
                url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
                numOfAttempts: 1,
            },
            incompleteExercise: false
        },
    ]);
    
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);

    const [studies, setStudies] = useState<string[]>(["Study 1", "Study 2", "Study 3"]);

    const studiesChangedHandler = (newStudies: string[]) => {
        setStudies(curr => [...newStudies])
        setChangingStudies(curr => false)
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
                difficuly: "",
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
        if (exerciseToDelete !== null) {
            const newExercises = exercises.filter((_, idx) => idx !== exerciseToDelete);
            setExercises(newExercises);
            setExerciseToDelete(null);
        }
        setOpenDialog(false);
    };

    const cancelDeleteExercise = () => {
        setExerciseToDelete(null);
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

    return (
        <div className="topic-element">
            <Accordion sx={{ backgroundColor: '#f5f5f5' }}>
                <AccordionSummary
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ height: '5remis' }}
                >
                    <div>
                        <div className="topic-title">Eigenvalues title</div>
                        <div className="number-of-exercises">Exercises: 25</div>
                    </div>
                </AccordionSummary>
                <Divider/>
                <AccordionDetails>
                    <div className="studies-section d-flex align-items-center">
                        {!changingStudies ? (
                            <div>
                                <div className="studies-header">
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
                            <StudyEdit studies={studies} allStudies={["Study 1", "Study 2", "Study 3", "Study 4"]} onStudiesSelected={studiesChangedHandler}></StudyEdit>
                        )}
                    </div>
                </AccordionDetails>
                <Divider/>
                <AccordionDetails>
                    <div className="exercises-section">
                        <div className="exercises-header" style={{marginBottom: "0.5rem"}}>
                            Exercises 
                            <FontAwesomeIcon icon={faPlus} className="add-exercise-icon" onClick={() => addNewExerciseHandler()}/>
                            {exercisesMode == "edit" ? (
                                <FontAwesomeIcon icon={faTrash} className="remove-exercises-icon" onClick={() => removingExercisesHandler()}/>
                            ) : (
                                <FontAwesomeIcon icon={faPen} className="edit-exercises-icon" onClick={() => editingExercisesHandler()}/>
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
                                    ) : (
                                        <FontAwesomeIcon icon={faTrash} size="sm" className="exercise-remove-icon d-flex col m-auto" onClick={() => handleDeleteExercise(index)}/>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
            <Dialog open={openDialog} onClose={cancelDeleteExercise}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete the exercise {exercises[exerciseToDelete!]?.exercise.name} (#{exercises[exerciseToDelete!]?.exercise.grasple_id})?
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