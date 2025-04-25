import { Accordion, AccordionDetails, AccordionSummary, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, ToggleButton, AccordionActions, TextField, List, ListItem, ListItemText, Snackbar, Typography, MenuItem} from "@mui/material"
import "./TopicElement.css"
import React, { useContext, useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faBarsStaggered, faCircleInfo, faFileImport, faFloppyDisk, faLink, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import StudyEdit from "./StudyEdit/StudyEdit"
import ExerciseElement from "../ExerciseElement/ExerciseElement"
import { Store } from 'react-notifications-component'
import { Tooltip } from "react-tooltip"
import { Exercise, Study, Topic } from "../SharedUtils"
import socket from "../../../socket"
import { TopicDataContext } from "../../../contexts/TopicDataContext"
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd"
import { ExistingExercisesContext } from "../ExistingExercisesContext"


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
    const [manuallyExpanded, setManuallyExpanded] = useState<boolean>(false)
    const [changingStudies, setChangingStudies] = useState<boolean>(false)
    const [editingExerciseIndex, setEditingExerciseIndex] = useState<number>(-1)
    const [exercisesMode, setExercisesMode] = useState<string>("")
    const [exercises, setExercises] = useState<ExerciseListElement[]>([])
    const [sortedExercises, setSortedExercises] = useState<ExerciseListElement[]>([])
    const [editName, setEditName] = useState<boolean>(false)
    const [newName, setNewName] = useState<string>("")
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [exerciseToDelete, setExerciseToDelete] = useState<number>(-1)

    const existingExerciseIds = useContext(ExistingExercisesContext);
    
    const [saveChanges, setSaveChanges] = useState<TopicChangesState>({
        name: false,
        studies: false,
        exercises: false
    })

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
    })

    const [studies, setStudies] = useState<Study[]>([])

    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
    const [isExistingExerciseDialogOpen, setIsExistingExerciseDialogOpen] = useState(false)
    const [existingExerciseGraspleId, setExistingExerciseGraspleId] = useState<number>(-1)
    const [searchInput, setSearchInput] = useState("")
    const [matchingExercises, setMatchingExercises] = useState<number[]>([])
    const [saveTopicChanges, setSaveTopicChanges] = useState<boolean>(false)
    const [unsavedTopicChanges, setUnsavedTopicChanges] = useState<boolean>(false)
    const notificationFlags = useRef<{ [key: string]: boolean }>({});

    const [isBatchDialogOpen, setIsBatchDialogOpen] = useState<boolean>(false);
    const [batchDifficulty, setBatchDifficulty] = useState<string>("Easy");
    const [batchText, setBatchText] = useState<string>("");
    const [changingTeams, setChangingTeams] = useState<boolean>(false);

    const showUnsavedChangesWarningNotification = (incorrectTopicField: string) => {
        // only add a notification if it hasn't already been shown
        if (notificationFlags.current[incorrectTopicField]) return;
        notificationFlags.current[incorrectTopicField] = true;

        let message = "";
        switch (incorrectTopicField) {
            case "name":
                message = "The topic must have a name set";
                break;
            case "studies":
                message = "The topic must have at least one study programme selected";
                break;
            case "exercises":
                message = "The topic must have at least one exercise";
                break;
            default:
                return;
        }

        Store.addNotification({
            title: "Warning",
            message: message,
            type: "warning",
            insert: "top",
            container: "bottom-right",
            dismiss: {
                duration: 5000,
                onScreen: true
            }
        });

        // Reset the flag after the notification has finished dismissing (with a small buffer)
        setTimeout(() => {
            notificationFlags.current[incorrectTopicField] = false;
        }, 5100);
    };

    const createBatchExercisesHandler = () => {
        const lines = batchText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
        let newExercisesBatch: ExerciseListElement[] = []
        lines.forEach(line => {
            let extractedUrl = line
            if (line.includes("<iframe")) {
                const srcMatch = line.match(/src="([^"]+)"/)
                if (srcMatch && srcMatch[1]) {
                    extractedUrl = srcMatch[1]
                }
            }
            if (!extractedUrl.includes("embed.grasple.com/exercises")) return
      
            const idMatch = extractedUrl.match(/id=(\d+)$/)
            let exerciseId = 0
            if (idMatch && idMatch[1]) {
                exerciseId = parseInt(idMatch[1], 10)
            }

            if (existingExerciseIds
                        .includes(exerciseId) 
                && !exercises
                        .map(exercise => exercise.exercise.exerciseId)
                        .includes(exerciseId)
                && !newExercisesBatch
                        .map(exercise => exercise.exercise.exerciseId)
                        .includes(exerciseId)
            ) {
                // In this case, we just link the existing exercise without asking to prevent overhead of notifications
                handleExerciseSelect(exerciseId)
            } else if (
                exercises
                        .map(exercise => exercise.exercise.exerciseId)
                        .includes(exerciseId)
                || newExercisesBatch
                        .map(exercise => exercise.exercise.exerciseId)
                        .includes(exerciseId)
            ) {
                // already in the topic, skip it
                console.log("Exercise already exists in the topic, skipping it")
                return
            }

            const newExercise: Exercise = {
                _id: "",
                name: "Exercise " + exerciseId.toString(),
                exerciseId: exerciseId,
                difficulty: batchDifficulty,
                url: extractedUrl,
                numOfAttempts: 1,
                isMandatory: false
            }
            newExercisesBatch.push({ exercise: newExercise, incompleteExercise: false });
        })
        if (newExercisesBatch.length > 0) {
            setExercises(curr => [...newExercisesBatch, ...curr])
        }
        setIsBatchDialogOpen(false)
        setBatchText("")
    }
    
    const anyUnsavedChanges = () => {
        return unsavedChanges.name || unsavedChanges.studies || unsavedChanges.exercises
    }

    const studiesChangedHandler = (newStudies: Study[]) => {
        setStudies(curr => [...newStudies])
    }

    const showSuccessNotification = (message: string) => {
        Store.addNotification({
            title: "Success",
            message: message,
            type: "success",
            insert: "top",
            container: "bottom-right",
            dismiss: {
                duration: 5000,
                onScreen: true
            }
        })
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
            })
        } else {
            setEditingExerciseIndex(curr => index)
        }
    }

    const exerciseFinishEditingHandler = (exerciseData: Exercise) => {
        const newExercises = [...exercises]
        newExercises[editingExerciseIndex] = { exercise: exerciseData, incompleteExercise: false }
        setExercises(curr => [...newExercises])
        setEditingExerciseIndex(-1)
    }

    const exerciseAlreadyExistsHandler = (exerciseId: number) => {
        if (exercises.some(exercise => exercise.exercise.exerciseId === exerciseId)) {
            Store.addNotification({
                title: "Warning",
                message: "This exercise already exists in the topic",
                type: "warning",
                insert: "top",
                container: "bottom-right",
                dismiss: {
                    duration: 5000,
                    onScreen: true
                }
            })
        } else {
            setExistingExerciseGraspleId(exerciseId)
            setIsExistingExerciseDialogOpen(true)
        }
    }

    const reorderMandatoryExercisesHandler = () => {
        setExercisesMode(curr => "reorder")
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
                    numOfAttempts: 1,
                    isMandatory: false
                },
                incompleteExercise: true,
            }
            const newExercises = [newExercise, ...exercises]
            setExercises(curr => [...newExercises])
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

    const sortExercises = () => {
        const incompleteExercises = exercises.filter(ex => ex.incompleteExercise)
        const mandatoryExercises = exercises.filter(ex => !ex.incompleteExercise && ex.exercise.isMandatory)
        const otherExercises = exercises.filter(ex => !ex.incompleteExercise && !ex.exercise.isMandatory)

        const sortedOtherExercises = [...otherExercises].sort((a, b) => {
            const difficultyOrder = ["Easy", "Medium", "Hard"]
            return difficultyOrder.indexOf(a.exercise.difficulty) - difficultyOrder.indexOf(b.exercise.difficulty)
        })

        return [...incompleteExercises, ...mandatoryExercises, ...sortedOtherExercises]
    }

    const handleDeleteExercise = (index: number) => {
        setExerciseToDelete(index)
        setOpenDialog(true)
    }

    const confirmDeleteExercise = () => {
        if (exerciseToDelete > -1) {
            const newExercises = exercises.filter((_, idx) => idx !== exerciseToDelete)
            setExercises([...newExercises])
            setExerciseToDelete(-1)
        }
        setOpenDialog(false)
    }

    const cancelDeleteExercise = () => {
        setExerciseToDelete(-1)
        setOpenDialog(false)
    }

    const discardEditingExerciseHandler = () => {
        setEditingExerciseIndex(-1)
        setExercises(curr => [...curr.filter((exercise, index) => exercise.incompleteExercise === false)])
    }

    function saveNameHandler(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        setSaveChanges(curr => ({...curr, name: true}))
    }

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchInput(value)
        const matches = props.availableGraspleIds.filter(graspleId => 
            graspleId.toString().includes(value)
        )
        setMatchingExercises(matches)
    }

    const handleExerciseSelect = (selectedExerciseGraspleId: number) => {
        props.onLinkExercise(selectedExerciseGraspleId)
        setIsLinkDialogOpen(false)
    }

    const addExistingExerciseHandler = () => {
        setEditingExerciseIndex(-1)
        setExercises(curr => [...curr.filter((exercise, index) => exercise.incompleteExercise === false)])
        props.onLinkExercise(existingExerciseGraspleId)
        setIsExistingExerciseDialogOpen(false)
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const items = [...exercises]
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        setExercises(curr => [...items])
    }

    useEffect(() => {
        const sorted = sortExercises()
        setSortedExercises(curr => [...sorted])
    }, [exercises])

    useEffect(() => {
        const firstIncompleteIndex = sortedExercises.findIndex(exercise => exercise.incompleteExercise)
        if (firstIncompleteIndex !== -1) {
            setEditingExerciseIndex(firstIncompleteIndex)
        }
    }, [sortedExercises])

    useEffect(() => {
        setNewTopicData(prevData => ({
            ...prevData,
            _id: props._id
        }))
    }, [props._id])
    
    useEffect(() => {
        setNewTopicData(prevData => ({
            ...prevData,
            name: props.name
        }))

        setNewName(curr => props.name)

        if (props.name == "") {
            setEditName(curr => true)
        }
    }, [props.name])
    
    useEffect(() => {
        if (studies.length == 0) {
            setNewTopicData(prevData => ({
            ...prevData,
            studies: props.studies
            }))
            setStudies(curr => [...props.studies])

            if (props.studies.length == 0) {
                setChangingStudies(curr => true)
            }}
    }, [props.studies])
    
    useEffect(() => {
        if (props.exercises) {
            setNewTopicData(prevData => ({
                ...prevData,
                exercises: props.exercises
            }))
            setExercises(curr => [...props.exercises.map(exercise => ({ exercise, incompleteExercise: false}))])

            if (props.exercises.length == 0) {
                setExercisesMode(curr => "edit")
            }
        }
    }, [props.exercises])

    useEffect(() => {
        let somethingChanged = false

        if (saveChanges.name) {
            if (newName == "") {
                showUnsavedChangesWarningNotification("name")
            } else {
                setNewTopicData(curr => ({...curr, name: newName}))
                setEditName(curr => false)
                setSaveChanges(curr => ({...curr, name: false}))
            }
            somethingChanged = true
        } 
        
        if (saveChanges.studies) {
            if (studies.length == 0) {
                showUnsavedChangesWarningNotification("studies")
            } else {
                setNewTopicData(curr => ({...curr, studies: studies}))
                setChangingStudies(curr => false)
            }
            somethingChanged = true
        } 
        
        if (saveChanges.exercises) {
            if (exercises.length == 0) {
                showUnsavedChangesWarningNotification("exercises")
            } else {
                const finalSortedExercises = sortExercises()
                setNewTopicData(curr => ({...curr, exercises: finalSortedExercises.map(exercise => exercise.exercise)}))
                setExercisesMode(curr => "")
                setEditingExerciseIndex(curr => -1)
            }
            somethingChanged = true
        }

        if (somethingChanged) {
            setUnsavedTopicChanges(curr => true)
        }

        if (unsavedTopicChanges && !saveChanges.name && !saveChanges.studies && !saveChanges.exercises) {
            setSaveTopicChanges(curr => true)
        }
    }, [saveChanges, unsavedTopicChanges])

    useEffect(() => {
        setChangingStudies(curr => false)
    }, [studies])

    useEffect(() => {
        setUnsavedChanges(curr => ({...curr, name: false}))
    }, [newTopicData.name])

    useEffect(() => {
        setUnsavedChanges(curr => ({...curr, studies: false}))
        setSaveChanges(curr => ({...curr, studies: false}))
    }, [newTopicData.studies])

    useEffect(() => {
        setUnsavedChanges(curr => ({...curr, exercises: false}))
        setSaveChanges(curr => ({...curr, exercises: false}))
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

        setUnsavedChanges(unsavedChangesState)
    }, [editName, changingStudies, exercisesMode])

    useEffect(() => {
        if (!unsavedChanges.name && !unsavedChanges.studies && !unsavedChanges.exercises && saveTopicChanges) {
            props.onUpdateTopic(newTopicData)
            setSaveTopicChanges(curr => false)
            setUnsavedTopicChanges(curr => false)
        }
    }, [unsavedChanges, saveTopicChanges])

    function discardExerciseChangesHandler(): void {
        if (exercises.length != 0) {
            setExercisesMode("")
            setSaveChanges(curr => ({...curr, exercises: false}))
            setExercises(curr => [...newTopicData.exercises.map(exercise => ({exercise, incompleteExercise: false}))])
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
                expanded={anyUnsavedChanges() || manuallyExpanded}
                onChange={(event: React.SyntheticEvent, expanded: boolean) => setManuallyExpanded(curr => expanded)}
                >
                <AccordionSummary
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ height: '5remis' }}
                >
                    <div>
                        <div className="topic-title">
                            {(newTopicData.name == "" ? "" : newTopicData.name)}
                        </div>
                        <div className="number-of-exercises">Exercises: {exercises.length}</div>
                        <div className="number-of-default-teams">There are currently {exercises.length}/{30} fake teams in the database for this topic</div>

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
                                        <div 
                                        key={index}
                                        className="study-element"
                                        data-tooltip-id="study-tooltip"
                                        data-tooltip-content={study.name}
                                    >
                                        {study.abbreviation}
                                    </div>
                                    ))}
                                </div>
                                <Tooltip id="study-tooltip" place="top" style={{zIndex: "9999"}}/>
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
                <div className="fake-teams-section">
                    <div className="fake-teams-header topic-header">
                    Default teams 
                    {changingTeams ? (<>
                        <Tooltip id="info-tooltip" place="top" style={{zIndex: "9999"}}/>
                        <FontAwesomeIcon
                                    icon={faCircleInfo}
                                    style={{ color: "#1976D2", marginLeft: "0.5rem" }}
                                    data-tooltip-id="info-tooltip"
                                    data-tooltip-place="right"
                                    data-tooltip-html="Add new default teams by pressing the + button.<br /> Remove the default teams from the database by pressing the trash icon."
                        />
                        <FontAwesomeIcon 
                            icon={faPlus} 
                            className="fake-teams-add-icon" 
                            onClick={() => {}}
                            style={{ marginLeft: "1rem", cursor: "pointer" }}
                        />
                        <FontAwesomeIcon 
                        icon={faTrash} 
                        className="fake-teams-remove-icon" 
                        onClick={() => {}}
                        style={{ marginLeft: "1rem", cursor: "pointer" }}
                        />
                    </>)
                    :
                    <FontAwesomeIcon icon={faPen} size="xs" className="edit-studies-icon" onClick={() => setChangingTeams(curr => true)}/>
                    }
                    
                    </div>
                    <Typography variant="body2" color="textSecondary" style={{ marginTop: "0.5rem" }}>
                    There are currently {20} fake teams in the database for this topic.
                    </Typography>
                </div>
                </AccordionDetails>

                <Divider/>
                <AccordionDetails>
                    <div className="exercises-section">
                        <div className="exercises-header topic-header" style={{marginBottom: "0.5rem"}}>
                            Exercises 
                            {exercisesMode != "" ? (
                                <>
                                <Tooltip id="info-tooltip" place="top" style={{zIndex: "9999"}}>
                                </Tooltip>
                                <Tooltip id="add-tooltip" place="top" style={{zIndex: "9999"}}>
                                </Tooltip>
                                <Tooltip id="link-tooltip" place="top" style={{zIndex: "9999"}}>
                                </Tooltip>
                                <Tooltip id="reorder-tooltip" place="top" style={{zIndex: "9999"}}>
                                </Tooltip>
                                <Tooltip id="batch-tooltip" place="top" style={{ zIndex: "9999" }} />
                                <FontAwesomeIcon
                                    icon={faCircleInfo}
                                    style={{ color: "#1976D2", marginLeft: "0.5rem" }}
                                    data-tooltip-id="info-tooltip"
                                    data-tooltip-place="right"
                                    data-tooltip-html="Add new exercises by pressing the + button.<br /> Add an existing exercise by pressing the link icon.<br />Adjust order of mandatory exercises using the reorder icon.<br />Edit/remove individual exercises using the icons on the right."
                                />
                                <FontAwesomeIcon 
                                    icon={faPlus} 
                                    className="add-exercise-icon" 
                                    onClick={() => addNewExerciseHandler()}
                                    data-tooltip-id="add-tooltip"
                                    data-tooltip-place="top"
                                    data-tooltip-html="Add new exercise"
                               />
                                <FontAwesomeIcon 
                                    icon={faLink} 
                                    className="link-exercise-icon" 
                                    onClick={() => linkExerciseHandler()}
                                    data-tooltip-id="link-tooltip"
                                    data-tooltip-place="top"
                                    data-tooltip-html="Add (link) existing exercise"/>
                                <FontAwesomeIcon 
                                    icon={faBarsStaggered} 
                                    className="reorder-exercises-icon" 
                                    onClick={() => reorderMandatoryExercisesHandler()}
                                    data-tooltip-id="reorder-tooltip"
                                    data-tooltip-place="top"
                                    data-tooltip-html="Reorder mandatory exercises"/>
                                <FontAwesomeIcon 
                                    icon={faFileImport} 
                                    className="batch-exercise-icon" 
                                    onClick={() => setIsBatchDialogOpen(true)}
                                    data-tooltip-id="batch-tooltip"
                                    data-tooltip-place="top"
                                    data-tooltip-html="Create batch of exercises"
                                />
                                </>
                                
                            ) : (
                                <FontAwesomeIcon icon={faPen} size="xs" className="edit-studies-icon" onClick={() => setExercisesMode(curr => "edit")}/>
                            )}
                        </div>
                        <div className="exercises-list">
                            {exercisesMode !== "reorder" ? sortedExercises.map((exerciseElement, index) => (
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
                                        parentSaveChanges={saveChanges.exercises}
                                        onFinishEditingExercise={(exerciseData: Exercise) => exerciseFinishEditingHandler(exerciseData)}
                                        onDiscardEditingExercise={() => discardEditingExerciseHandler()}
                                        onExerciseAlreadyExists={(exerciseId: number) => exerciseAlreadyExistsHandler(exerciseId)}
                                        isIndependentElement={false}
                                        isMandatory={exerciseElement.exercise.isMandatory}
                                        currentTopicExerciseIds={exercises.map(exercise => exercise.exercise.exerciseId)}
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
                            )) : (<>
                                <div className="reorder-exercises-instructions">
                                    Drag and drop the mandatory exercises in the preferred order you want them to appear in during the game.
                                </div>
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="exercises-list">
                                        {(provided) => (
                                            <div
                                                className="exercises-list"
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                {exercises
                                                    .filter(exerciseElement => exerciseElement.exercise.isMandatory)
                                                    .map((exerciseElement, index) => (
                                                        <Draggable key={exerciseElement.exercise.exerciseId} draggableId={exerciseElement.exercise._id} index={index}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="d-flex row"
                                                                >
                                                                    <ExerciseElement
                                                                        _id={exerciseElement.exercise._id} 
                                                                        name={exerciseElement.exercise.name} 
                                                                        exerciseId={exerciseElement.exercise.exerciseId} 
                                                                        difficulty={exerciseElement.exercise.difficulty} 
                                                                        url={exerciseElement.exercise.url} 
                                                                        numOfAttempts={exerciseElement.exercise.numOfAttempts}
                                                                        beingEdited={editingExerciseIndex == index}
                                                                        closeNotEditing={editingExerciseIndex > -1}
                                                                        parentSaveChanges={saveChanges.exercises}
                                                                        onFinishEditingExercise={(exerciseData: Exercise) => exerciseFinishEditingHandler(exerciseData)}
                                                                        onDiscardEditingExercise={() => discardEditingExerciseHandler()}
                                                                        onExerciseAlreadyExists={(exerciseId: number) => exerciseAlreadyExistsHandler(exerciseId)}
                                                                        isIndependentElement={false}
                                                                        isMandatory={exerciseElement.exercise.isMandatory}
                                                                        currentTopicExerciseIds={exercises.map(exercise => exercise.exercise.exerciseId)}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                                </>
                            )}
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
                        { matchingExercises.length === 0 && searchInput.length > 0 ? (
                            <Typography variant="body2" align="left" style={{ marginTop: "0.5rem", marginLeft: "0.1rem", color: "grey" }}>
                                Exercise not found
                            </Typography>
                        ) : (
                            <List>
                                {matchingExercises.map((graspleId, index) => (
                                    <ListItem className="grasple-id-list-item" key={index} onClick={() => handleExerciseSelect(graspleId)}>
                                        <ListItemText primary={`#${graspleId}`} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsLinkDialogOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

            <Dialog open={isExistingExerciseDialogOpen} onClose={() => setIsExistingExerciseDialogOpen(false)}>
                <DialogTitle>Link Existing Exercise</DialogTitle>
                <DialogContent>
                    {`The exercise with Grasple ID #${existingExerciseGraspleId} already exists in the system. Do you want to import the metadata for this exercise?`}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsExistingExerciseDialogOpen(false)} color="primary">Cancel</Button>
                    <Button onClick={() => addExistingExerciseHandler()} color="primary">Yes</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isBatchDialogOpen} onClose={() => setIsBatchDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Create a Batch of Exercises</DialogTitle>
                <DialogContent sx={{ overflow: 'hidden' }}>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: "1.5rem" }}>
                        Paste one or more iframe codes (each on a new line). The system will automatically extract the URL and exercise ID from each iframe. Indicate the difficulty of the exercises (same difficulty per batch) and click "Create" to add the exercises.
                    </Typography>
                    
                    <TextField
                        select
                        label="Select Difficulty"
                        value={batchDifficulty}
                        onChange={e => setBatchDifficulty(e.target.value)}
                        variant="outlined"
                        fullWidth
                        >
                        <MenuItem value="Easy">Easy</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Hard">Hard</MenuItem>
                    </TextField>
                    <TextField 
                        label="Paste iframe codes (one per line)" 
                        placeholder={`e.g. \n<iframe ...></iframe> \n<iframe ...></iframe>`}
                        multiline
                        rows={8}
                        value={batchText}
                        onChange={(e) => setBatchText(e.target.value)}
                        variant="outlined"
                        fullWidth
                        style={{ marginTop: "1rem" }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsBatchDialogOpen(false)}>Cancel</Button>
                    <Button onClick={createBatchExercisesHandler} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
            
            <Snackbar
                open={anyUnsavedChanges()}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                message="You have unsaved changes."
                action={
                    <Button color="primary" size="medium" onClick={saveTopicChangesHandler}>
                        Save
                    </Button>
                }
            />
        </div>
    )
}

export default TopicElement