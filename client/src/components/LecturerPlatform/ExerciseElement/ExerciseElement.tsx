import React, { useEffect, useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Divider, AccordionActions, Button, TextField, Switch } from '@mui/material';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import "./ExerciseElement.css";
import ExerciseURLInput from "./ExerciseURLInput/ExerciseURLInput";
import { url } from "inspector";
import { Store } from 'react-notifications-component';
import { Exercise } from "../SharedUtils";
import { set } from "react-hook-form";

interface Props {
    _id: string,
    name: string,
    exerciseId: number,
    difficulty: string,
    url: string,
    numOfAttempts: number   
    beingEdited: boolean
    closeNotEditing: boolean
    parentSaveChanges: boolean
    onFinishEditingExercise: (exerciseData: Exercise) => void
    onDiscardEditingExercise: (deleteExercise: boolean) => void
    onExerciseAlreadyExists: (exerciseId: number) => void
    isIndependentElement: boolean
    isMandatory: boolean
}

function ExerciseElement(props: Props) {
    const [manuallyExpanded, setManuallyExpanded] = useState<boolean>(false);
    const [newExerciseData, setNewExerciseData] = useState<Exercise>({
        _id: props._id,
        name: props.name,
        exerciseId: props.exerciseId,
        difficulty: props.difficulty,
        url: props.url,
        numOfAttempts: props.numOfAttempts,
        isMandatory: props.isMandatory
    })
    const [beingEdited, setBeingEdited] = useState<boolean>(props.beingEdited);
    const [nameChanged, setNameChanged] = useState<boolean>(false)

    useEffect(() => {
        setNewExerciseData({
            _id: props._id,
            name: props.name,
            exerciseId: props.exerciseId,
            difficulty: props.difficulty,
            url: props.url,
            numOfAttempts: props.numOfAttempts,
            isMandatory: props.isMandatory
        })

        if (props.name != "") {
            setNameChanged(true)
        }
    }, [props._id, props.name, props.exerciseId, props.difficulty, props.url, props.numOfAttempts])

    useEffect(() => {
        if (props.parentSaveChanges && beingEdited) {
            saveExerciseHandler()
        }
    }, [props.parentSaveChanges])

    useEffect(() => {
        setBeingEdited(props.beingEdited);
    }, [props.beingEdited])

    useEffect(() => {
        if (!nameChanged) {
            setNewExerciseData({ ...newExerciseData, name: "Exercise " + newExerciseData.exerciseId.toString()})
        }
    }, [newExerciseData.exerciseId])

    const saveExerciseHandler = () => {
        if (newExerciseData.name == "" || newExerciseData.url == "") {
            Store.addNotification({
                title: "Warning",
                message: "The exercise data is incomplete and cannot be saved",
                type: "warning",
                insert: "top",
                container: "bottom-right",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            })
        } else {
            props.onFinishEditingExercise(newExerciseData);
            if (props.isIndependentElement) {
                setBeingEdited(false)
            }
        }
    }

    const discardExerciseChangesHandler = () => {
        if (newExerciseData._id == "" && newExerciseData.exerciseId == -1) {
            props.onDiscardEditingExercise(true)
        } else {
            props.onDiscardEditingExercise(false)
        }

        if (props.isIndependentElement) setBeingEdited(false)
    }

    const urlChangeHandler = (newUrl: string, newGraspleId: number) => {
        setNewExerciseData({ ...newExerciseData, url: newUrl, exerciseId: newGraspleId })
    }

    useEffect(() => {
        if (props._id == "" && props.exerciseId == -1) {
            setBeingEdited(true)
        }
    }, [props._id, props.exerciseId])

    useEffect(() => {
        if (props.beingEdited) {
            setManuallyExpanded(true)
        }

        if (!props.beingEdited && props.closeNotEditing) {
            setManuallyExpanded(false)
        }
    }, [props.beingEdited, props.closeNotEditing])

    const nameInputChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewExerciseData({ ...newExerciseData, name: e.target.value })
        setNameChanged(true)
    }

    return (
        <div className={"d-flex col col-11" + (props.closeNotEditing && !props.beingEdited ? " disabled-exercise" : "")} 
            style={{position: "relative", margin: props.isIndependentElement ? "auto" : "", marginBottom: "1rem", marginTop: "0.5rem", width: props.isIndependentElement ? "80%" : ""}}>
            <Accordion 
                sx={{width: "100%", backgroundColor: props.isIndependentElement ? "#f5f5f5": ""}} 
                expanded={(!props.closeNotEditing && manuallyExpanded) || props.beingEdited || props._id == "" || (props.isIndependentElement && beingEdited)}
                onChange={(event: React.SyntheticEvent, expanded: boolean) => setManuallyExpanded(curr => expanded)}
            >
                <AccordionSummary
                    aria-controls={`panel-content-${props._id}`}
                    id={`panel-header-${props._id}`}
                    sx={{ height: '2rem'}}
                >
                    {!props.beingEdited || (props.isIndependentElement && !beingEdited) ? (
                        <div className="exercise-header d-flex row">
                            <div className="d-flex col col-10 align-items-center">
                                {props.name} 
                                <span className="exercise-header-id">(#{newExerciseData.exerciseId})</span>
                            </div>
                            {(!props.beingEdited || (props.isIndependentElement && !beingEdited)) && (
                                <div className="d-flex col-2 exercise-difficulty-label justify-content-end">
                                    {(props.isMandatory ? "Mandatory  |  " + props.difficulty : props.difficulty)}
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
                    <div className={"exercise-details d-flex row " + (props.beingEdited || (props.isIndependentElement && beingEdited) ? "editing-exercise " : "")}>
                        <div className="d-flex col col-1" style={{flexDirection: "column"}}>
                            <div>
                                Name:
                            </div>
                            {!props.isIndependentElement && (
                                <div>
                                    Mandatory:
                                </div>
                            )}
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
                        <div className="d-flex col" style={{flexDirection: "column", textAlign: props.isIndependentElement ? "left" : "inherit"}}>
                            {!props.beingEdited && !beingEdited ? (
                                <div>
                                    {props.name}
                                </div>
                            ) : (
                                <div className="d-flex row justify-content-start align-items-center" style={{ width: "100%", marginLeft: "0.5rem" }}>
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        placeholder="New Exercise"
                                        defaultValue={newExerciseData.name}
                                        onChange={(e) => nameInputChangeHandler(e)}
                                        sx={{height: "1rem", fontSize: "13px",  width: "80%"}}
                                        className="d-flex justify-content-center"
                                    />
                                </div>
                            )}
                            {!props.beingEdited && !beingEdited && !props.isIndependentElement ? (
                                <div>
                                    {(props.isMandatory ? "Yes" : "No")}
                                </div>
                            ) : !props.isIndependentElement ? (
                                <div className="d-flex row justify-content-start align-items-center" style={{ width: "100%", marginLeft: "0.5rem" }}>
                                    <Switch
                                        checked={newExerciseData.isMandatory}
                                        onChange={(e) => setNewExerciseData({ ...newExerciseData, isMandatory: e.target.checked })}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />
                                </div>
                            ) : null}
                            {!props.beingEdited && !beingEdited ? (
                                <div>
                                    <a href={props.url} target="_blank" rel="noreferrer">{props.url}</a>
                                </div>
                            )  : (
                                <ExerciseURLInput 
                                    url={props.url} 
                                    onURLValueChange={(newUrl: string, newId: number) => urlChangeHandler(newUrl, newId)}
                                    onExerciseAlreadyExists={(exerciseId: number) => props.onExerciseAlreadyExists(exerciseId)} 
                                ></ExerciseURLInput>
                            )}
                            {!props.beingEdited && !beingEdited ? (
                                <div>
                                    {props.difficulty}
                                </div>
                            ) : (
                                <div className="d-flex row justify-content-start align-items-center" style={{ width: "100%", marginLeft: "0.5rem" }}>
                                    <TextField
                                        select
                                        variant="outlined"
                                        size="small"
                                        defaultValue={newExerciseData.difficulty == "" ? "Easy" : newExerciseData.difficulty}
                                        onChange={(e) => setNewExerciseData({ ...newExerciseData, difficulty: e.target.value === "" ? "Easy" : e.target.value })}
                                        sx={{ height: "1rem", fontSize: "13px", width: "80%" }}
                                        className="d-flex justify-content-center"
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </TextField>
                                </div>
                            )}
                            {!props.beingEdited && !beingEdited ? (
                                <div>
                                    {props.numOfAttempts}
                                </div>
                            ) : (
                                <div className="d-flex row justify-content-start align-items-center" style={{ width: "100%", marginLeft: "0.5rem" }}>
                                    <TextField
                                        select
                                        variant="outlined"
                                        size="small"
                                        defaultValue={newExerciseData.numOfAttempts == 0 ? 1 : newExerciseData.numOfAttempts}
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
                {(props.beingEdited || (props.isIndependentElement && beingEdited)) && (
                    <AccordionActions>
                        <Button onClick={() => discardExerciseChangesHandler()}>Discard</Button>
                        <Button onClick={saveExerciseHandler} variant="contained">Save</Button>
                    </AccordionActions>
                )}
            </Accordion>
            {props.isIndependentElement && (
                <FontAwesomeIcon 
                    icon={faPen} 
                    className="edit-icon" 
                    size="sm"
                    onClick={() => setBeingEdited(true)} 
                />
            )}
        </div>
    );
}


export default ExerciseElement;