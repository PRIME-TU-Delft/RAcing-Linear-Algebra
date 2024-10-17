import { Accordion, AccordionDetails, AccordionSummary, Divider } from "@mui/material";
import "./TopicElement.css";
import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import StudyEdit from "./StudyEdit/StudyEdit";
import ExerciseElement from "../ExerciseElement/ExerciseElement";

interface Exercise {
    id: number,
    name: string,
    grasple_id: number,
    difficuly: string,
    url: string,
    numOfAttempts: number   
}

function TopicElement() {
    const [changingStudies, setChangingStudies] = useState<boolean>(false);
    const [editingExerciseIndex, setEditingExerciseIndex] = useState<number>(-1);
    const [exercises, setExercises] = useState<Exercise[]>([
        {
            id: 1,
            name: "Exercise 1",
            grasple_id: 7896,
            difficuly: "Easy",
            url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
            numOfAttempts: 1
        },
        {
            id: 1,
            name: "Exercise 1",
            grasple_id: 7896,
            difficuly: "Easy",
            url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
            numOfAttempts: 1
        },
        {
            id: 1,
            name: "Exercise 1",
            grasple_id: 7896,
            difficuly: "Easy",
            url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
            numOfAttempts: 1
        }
    ]);
    const [studies, setStudies] = useState<string[]>(["Study 1", "Study 2", "Study 3"]);

    const studiesChangedHandler = (newStudies: string[]) => {
        setStudies(curr => [...newStudies])
        setChangingStudies(curr => false)
    }

    const editingExerciseHandler = (index: number) => {
        setEditingExerciseIndex(curr => index)
    }

    const exerciseFinishEditingHandler = (exerciseData: Exercise) => {
        setExercises(curr => [...curr.map((exercise, idx) => idx === editingExerciseIndex ? exerciseData : exercise)]);
        setEditingExerciseIndex(-1);
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
                        <div className="exercises-header">
                            Exercises
                        </div>
                        <div className="exercises-list">
                            {exercises.map((exercise, index) => (
                                <div className="d-flex row" key={index}>
                                    <ExerciseElement 
                                        id={exercise.id} 
                                        name={exercise.name} 
                                        grasple_id={exercise.grasple_id} 
                                        difficuly={exercise.difficuly} 
                                        url={exercise.url} 
                                        numOfAttempts={exercise.numOfAttempts}
                                        beingEdited={editingExerciseIndex == index}
                                        closeNotEditing={editingExerciseIndex > -1}
                                        onFinishEditingExercise={(exerciseData: Exercise) => exerciseFinishEditingHandler(exerciseData)}
                                    ></ExerciseElement>
                                    <FontAwesomeIcon icon={faPen} size="sm" className="exercise-edit-icon d-flex col m-auto" onClick={() => editingExerciseHandler(index)}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}

export default TopicElement