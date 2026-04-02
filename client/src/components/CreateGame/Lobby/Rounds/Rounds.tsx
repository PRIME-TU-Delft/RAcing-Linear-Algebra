import React, { useEffect, useMemo, useState } from "react"
import "./Rounds.css"
import Round from "./Round/Round"
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import { TimePicker } from "@mui/x-date-pickers/TimePicker/TimePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs';
import { SECONDS } from "react-time-sync";
import { Checkbox, FormControl, FormControlLabel, InputAdornment, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { LobbyTopic } from "../../../../contexts/LobbyDataContext";

/**
 * Configure per-subject colors here.
 * Any subject not listed will be assigned a color from SUBJECT_COLOR_PALETTE automatically.
 */
const SUBJECT_COLORS: Record<string, string> = {
    "Linear Algebra": "#00B8C8",
    "Calculus": "#EC6842",
}
    
const SUBJECT_COLOR_PALETTE: string[] = [
    "#457b9d",
    "#e9c46a",
    "#6d6875",
    "#f4a261",
    "#264653",
    "#a8dadc",
    "#9b2226",
    "#0077b6",
];

interface SelectRoundProp {
    topicName: string,
    roundDuration: number
}

interface SelectedRound {
    topic: LobbyTopic,
    roundDuration: number
}

interface Props {
    onRoundSelected: (rounds: SelectRoundProp[]) => void
    onStepCompleted: (completed: boolean) => void
    availableRounds: LobbyTopic[]
    onFilterByStudyProgramme: (filter: boolean) => void
}

function Rounds(props: Props) {
    const [selectedRounds, setSelectedRounds] = useState<SelectedRound[]>([])
    const [unselectedRounds, setUnselectedRounds] = useState<LobbyTopic[]>([])
    const [availableRounds, setAvailableRounds] = useState<LobbyTopic[]>([])
    const [searchFilteredRounds, setSearchFilteredRounds] = useState<LobbyTopic[]>([])
    const [enableFilterByStudyProgramme, setEnableFilterByStudyProgramme] = useState<boolean>(false)
    const [hideDurations, setHideDurations] = useState<boolean>(false)
    const [topicSearchQuery, setTopicSearchQuery] = useState<string>("")
    const [subjectFilter, setSubjectFilter] = useState<string>("All Subjects")

    /** Sorted list of unique subjects across all available rounds. */
    const subjects = useMemo(() => {
        return Array.from(new Set(availableRounds.map(r => r.subject))).sort()
    }, [availableRounds])

    /** Maps each subject to a deterministic color (from SUBJECT_COLORS or the palette). */
    const subjectColorCache = useMemo(() => {
        const cache: Record<string, string> = {}
        subjects.forEach((subject, i) => {
            cache[subject] = SUBJECT_COLORS[subject] ?? SUBJECT_COLOR_PALETTE[i % SUBJECT_COLOR_PALETTE.length]
        })
        return cache
    }, [subjects])

    useEffect(() => {
        console.log("Available rounds updated: ", props.availableRounds)
        const sortedRounds = [...props.availableRounds].sort((a, b) => {
            if (a.subject < b.subject) return -1;
            if (a.subject > b.subject) return 1;
            return a.name.localeCompare(b.name);
        });

        setAvailableRounds(curr => sortedRounds)
        setUnselectedRounds(curr => sortedRounds)
        setSelectedRounds(curr => [])
    }, [props.availableRounds])

    useEffect(() => {
        let filtered = [...unselectedRounds]
        if (subjectFilter !== "All Subjects") {
            filtered = filtered.filter(topic => topic.subject === subjectFilter)
        }
        if (topicSearchQuery !== "") {
            filtered = filtered.filter(topic => topic.name.toLowerCase().includes(topicSearchQuery.toLowerCase()))
        }
        setSearchFilteredRounds(filtered)
    }, [topicSearchQuery, unselectedRounds, subjectFilter])

    useEffect(() => {
        props.onFilterByStudyProgramme(enableFilterByStudyProgramme)
    }, [enableFilterByStudyProgramme])

    const getPropStartRounds = (rounds: SelectedRound[]) => {
        return rounds.map(r => ({ topicName: r.topic.name, roundDuration: r.roundDuration }));
    }

    /**
     * Adds or removes selected topic, based on whether it was already selected or deselected and making sure number of rounds doesnt exceed 3
     * @param topic     // the topic selected
     * @param selected  // boolean for whether the topic was selected or deselected
     * @returns         // return proper class name for the rounds
     */
    const roundClickSelectionHandler = (topic: LobbyTopic, selected: boolean) => {
        if (selected && selectedRounds.length == 3) {
            alert(
                "You can select a maximum of 3 rounds! You can deselect a round by clicking on it again."
            )
        }
        // If a round is newly selected
        else if (selected) {
            // Find index in current sorted/filtered list or main unselected list
            // We use unselectedRounds as the source of truth for index if we use splice
            // But wait, unselectedRounds is the full list. We should find the index there.
            handleSelectRound(unselectedRounds.findIndex(t => t.name === topic.name), selectedRounds.length)
        }
        // We don't allow deselecting by click as it is not intuitive
    }

    const handleTopicSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTopicSearchQuery(event.target.value)
    }

    const changeSelectedRoundsOrder = (startIndex: number, endIndex: number) => {
        const items = [...selectedRounds];
        const [reorderedItem] = items.splice(startIndex, 1);
        items.splice(endIndex, 0, reorderedItem);
        setSelectedRounds(curr => [...items]);
        props.onRoundSelected(getPropStartRounds(items));
    }

    const handleSelectRound = (removeIndex: number, addIndex: number) => {
        // removeIndex is index in unselectedRounds
        const topicToAdd = unselectedRounds[removeIndex];
        
        const newSelectedRounds = [...selectedRounds]
        newSelectedRounds.splice(addIndex, 0, {topic: topicToAdd, roundDuration: 600})
        setSelectedRounds(curr => [...newSelectedRounds])

        const newAvailableRounds = [...unselectedRounds]
        newAvailableRounds.splice(removeIndex, 1)
        setUnselectedRounds(curr => [...newAvailableRounds])

        props.onRoundSelected(getPropStartRounds(newSelectedRounds))
        props.onStepCompleted(true)
    }

    const handleDeselectRound = (removeIndex: number, addIndex: number) => {
        const topicToReturn = selectedRounds[removeIndex].topic
        
        // When returning, we should keep the list sorted by subject
        // We can just add it and sort again
        let newAvailableRounds = [...unselectedRounds, topicToReturn]
        newAvailableRounds.sort((a, b) => {
            if (a.subject < b.subject) return -1;
            if (a.subject > b.subject) return 1;
            return a.name.localeCompare(b.name);
        });
        
        setUnselectedRounds(curr => newAvailableRounds)

        const newSelectedRounds = [...selectedRounds]
        newSelectedRounds.splice(removeIndex, 1)
        setSelectedRounds(curr => [...newSelectedRounds])

        props.onRoundSelected(getPropStartRounds(newSelectedRounds))
        if (newSelectedRounds.length == 0) props.onStepCompleted(false)  
    }

    const handleOnDragEnd = (result: DropResult) => {
        setHideDurations(curr => false) 

        if (!result.destination) return

        else if (result.source.droppableId == "selected-rounds" && result.destination.droppableId == "selected-rounds") {
            changeSelectedRoundsOrder(result.source.index, result.destination.index)
        }
        else if (result.source.droppableId == "available-rounds" && result.destination.droppableId == "selected-rounds") {
            // source.index is index in searchFilteredRounds, but we need index in unselectedRounds
            const topic = searchFilteredRounds[result.source.index];
            const realIndex = unselectedRounds.findIndex(t => t.name === topic.name);
            handleSelectRound(realIndex, result.destination.index)
        }
        else if (result.source.droppableId == "selected-rounds" && result.destination.droppableId == "available-rounds") {
            // We ignore designation index for available rounds as it Auto-Sorts
            handleDeselectRound(result.source.index, 0)
        }
    }

    const formatDuration = (duration: number) => {
        let minutes = Math.floor(duration / 60).toString()
        if (minutes.length == 1) minutes = "0" + minutes

        let seconds = (duration % 60).toString()
        if (seconds.length == 1) seconds = "0" + seconds
        
        return minutes + ":" + seconds
    }

    const handleAcceptRoundDuration = (value: dayjs.Dayjs | null, index: number) => {
        if (value) {
            const minutes = value.minute()
            const seconds = value.second() > 0 ? 30 : value.second()

            selectedRounds[index].roundDuration = minutes * 60 + seconds
        }
    }   

    let currentSubject = "";

    return (
        <DragDropContext onDragStart={() => setHideDurations(curr => true)} onDragEnd={(result) => handleOnDragEnd(result)}>
            <div className="dropbox-title">Selected topics</div>
            <Droppable droppableId="selected-rounds" direction="vertical">
                {(provided) => (
                    <div className={ (selectedRounds.length == 0 ? "empty-container " : "") + "selected-rounds-container"} {...provided.droppableProps} ref={provided.innerRef}>
                    {selectedRounds.length == 0 ? (<div className="empty-container-message">Drag topics here to select them for a round!</div>) : null}
                    {selectedRounds.map((round, index) => (
                        <div key={round.topic.name} className="selected-round-item">
                            <Draggable draggableId={round.topic.name} index={index} >
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                        <Round
                                            topic={round.topic.name}
                                            onSelectRound={(topicName: string, selected: boolean) =>
                                                { /* topicName passed back is string, but we can't reconstruct object easily. 
                                                     Actually Round expects string. selectionHandler sends string.
                                                     We need to find the object. */
                                                    const t = selectedRounds.find(r => r.topic.name === topicName)?.topic;
                                                    if(t) roundClickSelectionHandler(t, selected)
                                                }
                                            }
                                            selected={true}
                                            index={index}
                                            color={subjectColorCache[round.topic.subject]}
                                        ></Round>
                                    </div>
                                )}
                            </Draggable>
                            { !hideDurations ? ( 
                                    <div className="round-duration-container">
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <TimePicker 
                                                label="Round duration" 
                                                views={['minutes', 'seconds']} 
                                                format="mm:ss" 
                                                value={dayjs(formatDuration(selectedRounds[index].roundDuration), "mm:ss")}
                                                timeSteps={{minutes: 1, seconds: 30}}
                                                skipDisabled={true}
                                                minTime={dayjs("5:00", "mm:ss")}
                                                maxTime={dayjs("15:00", "mm:ss")}
                                                onChange={(value) => handleAcceptRoundDuration(value, index)}
                                                onAccept={(value) => handleAcceptRoundDuration(value, index)} />
                                        </LocalizationProvider>
                                    </div>
                                ) : null}
                        </div>
                    ))}
                    {provided.placeholder}
                </div>
                )}
            </Droppable>
            <div className="horizontal-line"></div>
            <div className="dropbox-title">
                Available topics
            </div>
            <div className="dropbox-helper-functionality">
            <TextField
                    placeholder="Search Available Topics"
                    variant="outlined"
                    size="small"
                    style={{width: '40%' }}
                    value={topicSearchQuery}
                    onChange={handleTopicSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FontAwesomeIcon icon={faSearch} />
                            </InputAdornment>
                        ),
                        style: { height: '2.5rem' }
                    }}
                />
                <FormControl size="small" style={{ marginLeft: '1rem', minWidth: '160px' }}>
                    <InputLabel id="subject-filter-label">Subject</InputLabel>
                    <Select
                        labelId="subject-filter-label"
                        value={subjectFilter}
                        label="Subject"
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        style={{ height: '2.5rem' }}
                    >
                        <MenuItem value="All Subjects">All Subjects</MenuItem>
                        {subjects.map(subject => (
                            <MenuItem key={subject} value={subject}>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        backgroundColor: subjectColorCache[subject],
                                        marginRight: 8,
                                        flexShrink: 0,
                                    }}
                                />
                                {subject}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                        checked={enableFilterByStudyProgramme}
                        onChange={(event) => setEnableFilterByStudyProgramme(event.target.checked)}
                        name="filterByStudyProgramme"
                        />
                    }
                    label="Filter by Study Programme"
                    style={{ marginLeft: '1rem' }}
                />
            </div>
            <Droppable droppableId="available-rounds" direction="horizontal">
                {(provided) => (
                    <div className="available-rounds-container" {...provided.droppableProps} ref={provided.innerRef}>
                        {searchFilteredRounds.map((roundTopic, index) => {
                            const showHeader = roundTopic.subject !== currentSubject;
                            if (showHeader) currentSubject = roundTopic.subject;

                            return (
                            <React.Fragment key={roundTopic.name}>
                                {showHeader && <div className="subject-header" style={{ width: '100%', padding: '10px 0', borderBottom: '1px solid #ccc', marginBottom: '10px', textAlign: 'left', color: "#000000"}}>{roundTopic.subject}</div>}
                                <Draggable draggableId={roundTopic.name} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                            <Round
                                                topic={roundTopic.name}
                                                onSelectRound={(topicName: string, selected: boolean) => {
                                                    const t = unselectedRounds.find(r => r.name === topicName)
                                                    if(t) roundClickSelectionHandler(t, selected)
                                                }}
                                                selected={false}
                                                index={index}
                                                color={subjectColorCache[roundTopic.subject]}
                                            ></Round>
                                        </div>
                                    )}
                                </Draggable>
                            </React.Fragment>
                        )})}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>

    )
}

export default Rounds
