import { Accordion, AccordionDetails, AccordionSummary, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, ToggleButton, AccordionActions, TextField, List, ListItem, ListItemText} from "@mui/material";
import "./TopicElement.css";
import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faFloppyDisk, faLink, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import StudyEdit from "./StudyEdit/StudyEdit";
import ExerciseElement from "../ExerciseElement/ExerciseElement";
import { Store } from 'react-notifications-component';
import { Tooltip } from "react-tooltip";
import { Exercise, Study, Topic } from "../SharedUtils";
import socket from "../../../socket";
import { TopicDataContext } from "../../../contexts/TopicDataContext";


interface ExerciseListElement {
    exercise: Exercise,
    incompleteExercise: boolean
}

interface TopicChangesState {
    name: boolean,
    studies: boolean,
    exercises: boolean
}

interface Props {
    _id: string,
    name: string,
    studies: Study[],
    exercises: Exercise[],
    onUpdateTopic: (topicData: Topic) => void,
    discardNewTopic: () => void,
    availableGraspleIds: number[]
    onLinkExercise: (graspleId: number) => void,
}

function TopicElement(props: Props) {
    const [manuallyExpanded, setManuallyExpanded] = useState<boolean>(false);
    const [changingStudies, setChangingStudies] = useState<boolean>(false);
    const [editingExerciseIndex, setEditingExerciseIndex] = useState<number>(-1);
    const [exercisesMode, setExercisesMode] = useState<string>("");
    const [exercises, setExercises] = useState<ExerciseListElement[]>([]);
    const [sortedExercises, setSortedExercises] = useState<ExerciseListElement[]>([]);
    const [editName, setEditName] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>("");
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<number>(-1);

    const [saveChanges, setSaveChanges] = useState<TopicChangesState>({
        name: false,
        studies: false,
        exercises: false
    });

    const [unsavedChanges, setUnsavedChanges] = useState<TopicChangesState>({
        name: true,
        studies: true,
        exercises: true
    })

    const [newTopicData, setNewTopicData] = useState<Topic>({
        _id: "",
        name: "",
        studies: [],
        exercises: []
    });

    const [studies, setStudies] = useState<Study[]>([]);

    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [matchingExercises, setMatchingExercises] = useState<number[]>([]);

    const studiesChangedHandler = (newStudies: Study[]) => {
        setStudies(curr => [...newStudies])
        setChangingStudies(curr => false)
        setSaveChanges(curr => ({...curr, studies: true}))
    }

    const unsavedTopicChanges = () => {
        return unsavedChanges.name || unsavedChanges.studies || unsavedChanges.exercises
    }

    const showUnsavedChangesWarningNotification = (incorrectTopicField: string) => {
        switch (incorrectTopicField) {
            case "name":
                Store.addNotification({
                    title: "Warning",
                    message: "The topic must have a name set",
                    type: "warning",
                    insert: "top",
                    container: "bottom-right",
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                })
                break
            
            case "studies":
                Store.addNotification({
                    title: "Warning",
                    message: "The topic must have at least one study programme selected",
                    type: "warning",
                    insert: "top",
                    container: "bottom-right",
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                })
                break

            case "exercises":
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
                })
                break
            
            default:
                break
        }
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
        const newExercises = exercises.map((exercise, idx) => idx === editingExerciseIndex ? {exercise: exerciseData, incompleteExercise: false, isMandatory: false} : exercise)
        setExercises(curr => [...newExercises])
        setEditingExerciseIndex(-1)
    }

    const addNewExerciseHandler = () => {
        if (exercises.some(exercise => exercise.incompleteExercise)) {
            Store.addNotification({
            title: "Warning",
            message: "You must complete the current exercise before adding a new one",
            type: "warning",
            insert: "top",
            container: "bottom-right",
            dismiss: {
                duration: 5000,
                onScreen: true
            }
            })
        } else {
            const newExercise: ExerciseListElement = {
                exercise:{
                    _id: "",
                    name: "",
                    exerciseId: 0,
                    difficulty: "Easy",
                    url: "",
                    numOfAttempts: 0,
                    isMandatory: false
                },
                incompleteExercise: true,
            }
            const newExercises = [newExercise, ...exercises]
            setExercises(curr => [...newExercises])
            setEditingExerciseIndex(0)
        }
    }

    const linkExerciseHandler = () => {
        if (exercises.some(exercise => exercise.incompleteExercise)) {
            Store.addNotification({
                title: "Warning",
                message: "You must complete the current exercise before adding a new one",
                type: "warning",
                insert: "top",
                container: "bottom-right",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            })
        } 
        else {
            setIsLinkDialogOpen(true)
        }
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

    const discardEditingExerciseHandler = () => {
        setEditingExerciseIndex(-1);
        setExercises(curr => [...curr.filter((exercise, index) => exercise.incompleteExercise === false)]);
    }

    function saveNameHandler(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        setSaveChanges(curr => ({...curr, name: true}));
    }

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        const matches = props.availableGraspleIds.filter(graspleId => 
            graspleId.toString().includes(value)
        );
        setMatchingExercises(matches);
    };

    const handleExerciseSelect = (selectedExerciseGraspleId: number) => {
        props.onLinkExercise(selectedExerciseGraspleId);
        setIsLinkDialogOpen(false);
    };

    useEffect(() => {
        const sorted = [...exercises].sort((a, b) => {
            if (a.exercise.isMandatory && !b.exercise.isMandatory) return -1
            if (!a.exercise.isMandatory && b.exercise.isMandatory) return 1
            const difficultyOrder = ["Easy", "Medium", "Hard"]
            return difficultyOrder.indexOf(a.exercise.difficulty) - difficultyOrder.indexOf(b.exercise.difficulty)
        })

        setSortedExercises(curr => [...sorted])
    }, [exercises]);

    useEffect(() => {
        setNewTopicData(prevData => ({
            ...prevData,
            id: props._id
        }));
    }, [props._id]);
    
    useEffect(() => {
        setNewTopicData(prevData => ({
            ...prevData,
            name: props.name
        }));

        if (props.name == "") {
            setEditName(curr => true)
        }
    }, [props.name]);
    
    useEffect(() => {
        setNewTopicData(prevData => ({
            ...prevData,
            studies: props.studies
        }))
        setStudies(curr => [...props.studies])

        if (props.studies.length == 0) {
            setChangingStudies(curr => true)
        }
    }, [props.studies]);
    
    useEffect(() => {
        if (props.exercises) {
            setNewTopicData(prevData => ({
                ...prevData,
                exercises: props.exercises
            }))
            setExercises(curr => [...props.exercises.map(exercise => ({ exercise, incompleteExercise: false, isMandatory: false }))])

            if (props.exercises.length == 0) {
                setExercisesMode(curr => "edit")
            }
        }
    }, [props.exercises]);

    useEffect(() => {
        if (saveChanges.name) {
            setSaveChanges(curr => ({...curr, name: false}))

            if (newName == "") {
                showUnsavedChangesWarningNotification("name");
            } else {
                setNewTopicData(curr => ({...curr, name: newName}))
                setEditName(curr => false)
            }
        } 
        
        if (saveChanges.studies) {
            setSaveChanges(curr => ({...curr, studies: false}))

            if (studies.length == 0) {
                showUnsavedChangesWarningNotification("studies")
            } else {
                setNewTopicData(curr => ({...curr, studies: studies}))
                setChangingStudies(curr => false)
            }
        } 
        
        if (saveChanges.exercises) {
            setSaveChanges(curr => ({...curr, exercises: false}))

            if (exercises.length == 0) {
                showUnsavedChangesWarningNotification("exercises")
            } else {
                setNewTopicData(curr => ({...curr, exercises: exercises.map(exercise => exercise.exercise)}))
                setExercisesMode(curr => "")
            }
        }
    }, [saveChanges])

    useEffect(() => {
        setUnsavedChanges(curr => ({...curr, name: false}));
    }, [newTopicData.name])

    useEffect(() => {
        setUnsavedChanges(curr => ({...curr, studies: false}));
    }, [newTopicData.studies])

    useEffect(() => {
        setUnsavedChanges(curr => ({...curr, exercises: false}));
    }, [newTopicData.exercises])

    useEffect(() => {
        const unsavedChangesState: TopicChangesState = {
            name: false,
            studies: false,
            exercises: false
        }

        if (editName) {
            unsavedChangesState.name = true
        }
        if (changingStudies) {
            unsavedChangesState.studies = true
        }
        if (exercisesMode != "") {
            unsavedChangesState.exercises = true
        }

        setUnsavedChanges(unsavedChangesState);
    }, [editName, changingStudies, exercisesMode])

    useEffect(() => {
        if (!unsavedChanges.name && !unsavedChanges.studies && !unsavedChanges.exercises) {
            props.onUpdateTopic(newTopicData);
        }
    }, [unsavedChanges])

    function discardExerciseChangesHandler(): void {
        if (exercises.length != 0) {
            setExercisesMode("")
            setSaveChanges(curr => ({...curr, exercises: false}))
            setExercises(curr => [...newTopicData.exercises.map(exercise => ({exercise, incompleteExercise: false, isMandatory: false}))])
        }
    }

    function saveExercisesHandler(): void {
        setSaveChanges(curr => ({...curr, exercises: true}))
    }

    function saveTopicChangesHandler(): void {
        setSaveChanges(curr => ({name: true, studies: true, exercises: true}))
    }

    return (
        <div className="topic-element">
            <Accordion 
                sx={{ backgroundColor: '#f5f5f5' }}
                expanded={unsavedTopicChanges() || manuallyExpanded}
                onChange={(event: React.SyntheticEvent, expanded: boolean) => setManuallyExpanded(curr => expanded)}
                >
                <AccordionSummary
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ height: '5remis' }}
                >
                    <div>
                        <div className="topic-title">
                            {(newTopicData.name == "" ? "New Exercise" : newTopicData.name)}
                        </div>
                        <div className="number-of-exercises">Exercises: {exercises.length}</div>
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
                                    {newTopicData.name} 
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
                        <Button size="small" onClick={() => {if (newName != "") setEditName(false)}}>Discard</Button>
                        <Button size="small" onClick={saveNameHandler} variant="contained">Save</Button>
                    </AccordionActions>
                )}
                <Divider/>
                <AccordionDetails>
                    <div className="studies-section d-flex align-items-center">
                        {!changingStudies ? (
                            <div>
                                <div className="studies-header topic-header">
                                Study programmes <FontAwesomeIcon icon={faPen} size="xs" className="edit-studies-icon" onClick={() => setChangingStudies(curr => true)}/>
                                </div>
                                <div className="studies-list">
                                    {studies.map((study, index) => (
                                        <div key={index} className="study-element">
                                            {study.abbreviation}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <StudyEdit studies={studies} onStudiesSelected={studiesChangedHandler} saveChanges={saveChanges.studies}></StudyEdit>
                        )}
                    </div>
                </AccordionDetails>
                {changingStudies && (<AccordionActions>
                    <Button size="small" onClick={() => {if (studies.length != 0) setChangingStudies(false)}}>Discard</Button>
                    <Button size="small" onClick={() => setSaveChanges(curr => ({...curr, studies: true}))} variant="contained">Save</Button>
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
                                    data-tooltip-html="Add new exercises by pressing the + button.<br /> Add an existing exercise by pressing the link icon.<br />Edit/remove individual exercises using the icons on the right."
                                />
                                <FontAwesomeIcon icon={faPlus} className="add-exercise-icon" onClick={() => addNewExerciseHandler()}/>
                                <FontAwesomeIcon icon={faLink} className="link-exercise-icon" onClick={() => linkExerciseHandler()}/>
                                </>
                            ) : (
                                <FontAwesomeIcon icon={faPen} size="xs" className="edit-studies-icon" onClick={() => setExercisesMode(curr => "edit")}/>
                            )}
                        </div>
                        <div className="exercises-list">
                            {sortedExercises.map((exerciseElement, index) => (
                                <div className="d-flex row" key={index}>
                                    <ExerciseElement 
                                        _id={exerciseElement.exercise._id} 
                                        name={exerciseElement.exercise.name} 
                                        exerciseId={exerciseElement.exercise.exerciseId} 
                                        difficulty={exerciseElement.exercise.difficulty} 
                                        url={exerciseElement.exercise.url} 
                                        numOfAttempts={exerciseElement.exercise.numOfAttempts}
                                        beingEdited={editingExerciseIndex == index}
                                        closeNotEditing={editingExerciseIndex > -1}
                                        onFinishEditingExercise={(exerciseData: Exercise) => exerciseFinishEditingHandler(exerciseData)}
                                        onDiscardEditingExercise={() => discardEditingExerciseHandler()}
                                        isIndependentElement={false}
                                        isMandatory={exerciseElement.exercise.isMandatory}
                                    ></ExerciseElement>
                                    {exercisesMode === "edit" && (
                                        <div className="d-flex col  m-auto">
                                            <div className="d-flex row">
                                                <FontAwesomeIcon icon={faPen} size="sm" className="exercise-edit-icon d-flex col m-auto" onClick={() => editingExerciseHandler(index)}/>
                                                <FontAwesomeIcon icon={faTrash} size="sm" className="exercise-remove-icon d-flex col m-auto" onClick={() => handleDeleteExercise(index)}/>
                                            </div>
                                        </div>
                                    )}
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
                    <DialogTitle>Confirm Remove</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to remove the exercise {exercises[exerciseToDelete]?.exercise.name} (#{exercises[exerciseToDelete]?.exercise.exerciseId}) from this topic?
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

                <Dialog open={isLinkDialogOpen} onClose={() => setIsLinkDialogOpen(false)}>
                <DialogTitle>Link Existing Exercise</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Search by Grasple ID"
                        type="text"
                        fullWidth
                        value={searchInput}
                        onChange={handleSearchInputChange}
                    />
                    <List>
                        {matchingExercises.map((graspleId, index) => (
                            <ListItem className="grasple-id-list-item" key={index} onClick={() => handleExerciseSelect(graspleId)}>
                                <ListItemText primary={`#${graspleId}`} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsLinkDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

                {unsavedTopicChanges() && (
                    <div className="topic-save-icon">
                        <FontAwesomeIcon icon={faFloppyDisk} size="xl" onClick={() => saveTopicChangesHandler()}/>
                    </div>
                )}
        </div>
    );
}

export default TopicElement