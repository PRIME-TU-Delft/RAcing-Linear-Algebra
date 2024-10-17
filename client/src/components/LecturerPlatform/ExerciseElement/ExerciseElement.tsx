import React, { useEffect, useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Divider, AccordionActions, Button, TextField } from '@mui/material';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import "./ExerciseElement.css";
import ExerciseURLInput from "./ExerciseURLInput/ExerciseURLInput";

interface Exercise {
    id: number,
    name: string,
    grasple_id: number,
    difficuly: string,
    url: string,
    numOfAttempts: number   
}
interface Props {
    id: number,
    name: string,
    grasple_id: number,
    difficuly: string,
    url: string,
    numOfAttempts: number   
    beingEdited: boolean
    closeNotEditing: boolean
    onFinishEditingExercise: (exerciseData: Exercise) => void
    onDiscardEditingExercise: () => void
}

function ExerciseElement(props: Props) {
    const [manuallyExpanded, setManuallyExpanded] = useState<boolean>(false);
    const [newExerciseData, setNewExerciseData] = useState<Exercise>({
        id: props.id,
        name: props.name,
        grasple_id: props.grasple_id,
        difficuly: props.difficuly,
        url: props.url,
        numOfAttempts: props.numOfAttempts
    })

    useEffect(() => {
        if (props.beingEdited) {
            setManuallyExpanded(true);
        }

        if (!props.beingEdited && props.closeNotEditing) {
            setManuallyExpanded(false);
        }
    }, [props.beingEdited, props.closeNotEditing])

    return (
        <div className={"d-flex col col-11" + (props.closeNotEditing && !props.beingEdited ? " disabled-exercise" : "")} style={{marginBottom: "0.5rem"}}>
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
                    {!props.beingEdited ? (
                        <div className="exercise-header d-flex row">
                            <div className="d-flex col col-11">
                                {props.name} 
                                <span className="exercise-header-id">(#{props.grasple_id})</span>
                            </div>
                            {!props.beingEdited && (
                                <div className="d-flex col-1 exercise-difficulty-label justify-content-end">
                                    {props.difficuly}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="exercise-header d-flex row">
                            <div className="d-flex col col-11">
                                New Exercise
                            </div>
                        </div>
                    )}
                </AccordionSummary>
                <Divider></Divider>
                <AccordionDetails>
                    <div className={"exercise-details d-flex row " + (props.beingEdited ? "editing-exercise " : "")}>
                        <div className="d-flex col col-1" style={{flexDirection: "column"}}>
                            <div>
                                Name:
                            </div>
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
                            {!props.beingEdited ? (
                                <div>
                                    {props.name}
                                </div>
                            ) : (
                                <div className="d-flex row justify-content-start align-items-center" style={{ width: "100%", marginLeft: "0.5rem" }}>
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        defaultValue={props.name}
                                        onChange={(e) => console.log(e.target.value)}
                                        sx={{height: "1rem", fontSize: "13px",  width: "80%"}}
                                        className="d-flex justify-content-center"
                                    />
                                </div>
                            )}
                            {!props.beingEdited ? (
                                <div>
                                    <a href={props.url} target="_blank" rel="noreferrer">{props.url}</a>
                                </div>
                            )  : (
                                <ExerciseURLInput url={props.url}></ExerciseURLInput>
                            )}
                            {!props.beingEdited ? (
                                <div>
                                    {props.difficuly}
                                </div>
                            ) : (
                                <div className="d-flex row justify-content-start align-items-center" style={{ width: "100%", marginLeft: "0.5rem" }}>
                                    <TextField
                                        select
                                        variant="outlined"
                                        size="small"
                                        defaultValue={newExerciseData.difficuly}
                                        onChange={(e) => setNewExerciseData({ ...newExerciseData, difficuly: e.target.value })}
                                        sx={{ height: "1rem", fontSize: "13px", width: "80%" }}
                                        className="d-flex justify-content-center"
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        <option value="Mandatory">Mandatory</option>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </TextField>
                                </div>
                            )}
                            {!props.beingEdited ? (
                                <div>
                                    {props.numOfAttempts}
                                </div>
                            ) : (
                                <div className="d-flex row justify-content-start align-items-center" style={{ width: "100%", marginLeft: "0.5rem" }}>
                                    <TextField
                                        select
                                        variant="outlined"
                                        size="small"
                                        defaultValue={newExerciseData.difficuly}
                                        onChange={(e) => setNewExerciseData({ ...newExerciseData, numOfAttempts: parseInt(e.target.value)})}
                                        sx={{ height: "1rem", fontSize: "13px", width: "80%" }}
                                        className="d-flex justify-content-center"
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                    </TextField>
                                </div>
                            )}
                        </div>
                    </div>
                </AccordionDetails>
                {props.beingEdited && (
                    <AccordionActions>
                        <Button onClick={() => props.onDiscardEditingExercise()}>Discard</Button>
                        <Button onClick={() => props.onFinishEditingExercise(newExerciseData)} variant="contained">Save</Button>
                    </AccordionActions>
                )}
            </Accordion>
        </div>
    );
}


export default ExerciseElement;