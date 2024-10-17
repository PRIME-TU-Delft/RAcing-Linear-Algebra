import React, { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Divider, AccordionActions, Button } from '@mui/material';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import "./ExerciseElement.css";

interface Props {
    id: number,
    name: string,
    grasple_id: number,
    difficuly: string,
    url: string,
    numOfAttempts: number   
    beingEdited: boolean
    closeNotEditing: boolean
}


function ExerciseElement(props: Props) {
    const [manuallyExpanded, setManuallyExpanded] = useState<boolean>(false);
    const [editingExercise, setEditingExercise] = useState<boolean>(false);

    return (
        <div className="d-flex col col-11" style={{marginBottom: "0.5rem"}}>
            <Accordion 
                sx={{width: "100%"}} 
                expanded={(!props.closeNotEditing && manuallyExpanded) || props.beingEdited }
                onChange={(event: React.SyntheticEvent, expanded: boolean) => setManuallyExpanded(curr => expanded)}
            >
                <AccordionSummary
                    aria-controls={`panel-content-${props.id}`}
                    id={`panel-header-${props.id}`}
                    sx={{ height: '2rem', marginTop: '0.5rem'}}
                >
                    <div className="exercise-header d-flex row">
                        <div className="d-flex col col-11">
                            {props.name} 
                            <span className="exercise-header-id">(#{props.grasple_id})</span>
                        </div>
                        <div className="d-flex col-1 exercise-difficulty-label justify-content-end">
                            {props.difficuly}
                        </div>
                    </div>
                </AccordionSummary>
                <Divider></Divider>
                <AccordionDetails>
                    <div className="exercise-details d-flex row">
                        <div className="d-flex col col-1" style={{flexDirection: "column"}}>
                            <div>
                                URL:
                            </div>
                            <div>
                                Difficulty:
                            </div>
                            <div>
                                Attempts:
                            </div>
                        </div>
                        <div className="d-flex col" style={{flexDirection: "column"}}>
                            <div>
                                <a href={props.url} target="_blank" rel="noreferrer">{props.url}</a>
                            </div>
                            <div>
                                {props.difficuly}
                            </div>
                            <div>
                                {props.numOfAttempts}
                            </div>
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}


export default ExerciseElement;