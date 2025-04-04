import React, { useEffect, useState } from "react"
import "./Rounds.css"
import Round from "./Round/Round"
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import { TimePicker } from "@mui/x-date-pickers/TimePicker/TimePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs';
import { SECONDS } from "react-time-sync";
import { Checkbox, FormControlLabel, InputAdornment, TextField } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface SelectedRound {
    topicName: string,
    roundDuration: number
}

interface Props {
    onRoundSelected: (rounds: SelectedRound[]) => void
    onStepCompleted: (completed: boolean) => void
    availableRounds: string[]
    onFilterByStudyProgramme: (filter: boolean) => void
}

function Rounds(props: Props) {
    const [selectedRounds, setSelectedRounds] = useState<SelectedRound[]>([])
    const [unselectedRounds, setUnselectedRounds] = useState<string[]>([])
    const [availableRounds, setAvailableRounds] = useState<string[]>([])
    const [searchFilteredRounds, setSearchFilteredRounds] = useState<string[]>([])
    const [enableFilterByStudyProgramme, setEnableFilterByStudyProgramme] = useState<boolean>(false)
    const [hideDurations, setHideDurations] = useState<boolean>(false)
    const [topicSearchQuery, setTopicSearchQuery] = useState<string>("")

    useEffect(() => {
        if (availableRounds.toString() != props.availableRounds.toString()) {
            setAvailableRounds(curr => [...props.availableRounds])
            setUnselectedRounds(curr => [...props.availableRounds])
            setSelectedRounds(curr => [])
        }
    }, [props.availableRounds])

    useEffect(() => {
        if (topicSearchQuery == "") {
            setSearchFilteredRounds(curr => [...unselectedRounds])
        }
        else {
            setSearchFilteredRounds(curr => unselectedRounds.filter(topic => topic.toLowerCase().includes(topicSearchQuery.toLowerCase())))
        }
    }, [topicSearchQuery, unselectedRounds])

    useEffect(() => {
        props.onFilterByStudyProgramme(enableFilterByStudyProgramme)
    }, [enableFilterByStudyProgramme])

    /**
     * Adds or removes selected topic, based on whether it was already selected or deselected and making sure number of rounds doesnt exceed 3
     * @param topic     // the topic selected
     * @param selected  // boolean for whether the topic was selected or deselected
     * @returns         // return proper class name for the rounds
     */
    const roundClickSelectionHandler = (topic: string, selected: boolean) => {
        if (selected && selectedRounds.length == 3) {
            alert(
                "You can select a maximum of 3 rounds! You can deselect a round by clicking on it again."
            )
        }
        // If a round is newly selected
        else if (selected) {
            handleSelectRound(unselectedRounds.indexOf(topic), selectedRounds.length)
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
    }

    const handleSelectRound = (removeIndex: number, addIndex: number) => {
        const newSelectedRounds = [...selectedRounds]
        newSelectedRounds.splice(addIndex, 0, {topicName: unselectedRounds[removeIndex], roundDuration: 600})
        setSelectedRounds(curr => [...newSelectedRounds])

        const newAvailableRounds = [...unselectedRounds]
        newAvailableRounds.splice(removeIndex, 1)
        setUnselectedRounds(curr => [...newAvailableRounds])

        props.onRoundSelected(newSelectedRounds)
        props.onStepCompleted(true)
    }

    const handleDeselectRound = (removeIndex: number, addIndex: number) => {
        const newAvailableRounds = [...unselectedRounds]
        newAvailableRounds.splice(addIndex, 0, selectedRounds[removeIndex].topicName)
        setUnselectedRounds(curr => [...newAvailableRounds])

        const newSelectedRounds = [...selectedRounds]
        newSelectedRounds.splice(removeIndex, 1)
        setSelectedRounds(curr => [...newSelectedRounds])

        props.onRoundSelected(newSelectedRounds)
        if (selectedRounds.length == 0) props.onStepCompleted(false)  
    }

    const handleOnDragEnd = (result: DropResult) => {
        setHideDurations(curr => false) 

        if (!result.destination) return

        else if (result.source.droppableId == "selected-rounds" && result.destination.droppableId == "selected-rounds") {
            changeSelectedRoundsOrder(result.source.index, result.destination.index)
        }
        else if (result.source.droppableId == "available-rounds" && result.destination.droppableId == "selected-rounds") {
            handleSelectRound(result.source.index, result.destination.index)
        }
        else if (result.source.droppableId == "selected-rounds" && result.destination.droppableId == "available-rounds") {
            handleDeselectRound(result.source.index, result.destination.index)
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

    return (
        <DragDropContext onDragStart={() => setHideDurations(curr => true)} onDragEnd={(result) => handleOnDragEnd(result)}>
            <div className="dropbox-title">Selected topics</div>
            <Droppable droppableId="selected-rounds" direction="vertical">
                {(provided) => (
                    <div className={ (selectedRounds.length == 0 ? "empty-container " : "") + "selected-rounds-container"} {...provided.droppableProps} ref={provided.innerRef}>
                    {selectedRounds.length == 0 ? (<div className="empty-container-message">Drag topics here to select them for a round!</div>) : null}
                    {selectedRounds.map((round, index) => (
                        <div key={round.topicName} className="selected-round-item">
                            <Draggable draggableId={round.topicName} index={index} >
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                        <Round
                                            topic={round.topicName}
                                            onSelectRound={(topic: string, selected: boolean) =>
                                                roundClickSelectionHandler(topic, selected)
                                            }
                                            selected={true}
                                            index={index}
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
                        {searchFilteredRounds.map((roundTopic, index) => (
                            <Draggable draggableId={roundTopic} index={index} key={roundTopic}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                        <Round
                                            topic={roundTopic}
                                            onSelectRound={(topic: string, selected: boolean) =>
                                                roundClickSelectionHandler(topic, selected)
                                            }
                                            selected={false}
                                            index={index}
                                        ></Round>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>

    )
}

export default Rounds
