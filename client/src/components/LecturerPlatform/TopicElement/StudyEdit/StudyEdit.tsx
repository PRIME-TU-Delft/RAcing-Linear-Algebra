import React, { useEffect, useState } from "react";
import "./StudyEdit.css";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Checkbox, Button, Divider } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";

interface Props {
    studies: string[],
    allStudies: string[]
    onStudiesSelected: (studies: string[]) => void
    saveChanges: boolean
}

function StudyEdit(props: Props) {
    const [selectedStudies, setSelectedStudies] = useState(props.studies)
    const [unselectedStudies, setUnselectedStudies] = useState<string[]>(
        props.allStudies.filter(study => !props.studies.includes(study))
    )

    const handleSelectAllCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedStudies(curr => [...props.allStudies])
            setUnselectedStudies(curr => [])
        }
      };

    const changeStudyOrder = (startIndex: number, endIndex: number) => {
        const items = [...selectedStudies];
        const [reorderedItem] = items.splice(startIndex, 1);
        items.splice(endIndex, 0, reorderedItem);
        setSelectedStudies(curr => [...items]);
    }

    const handleSelectStudy = (removeIndex: number, addIndex: number) => {
        const newSelectedStudies = [...selectedStudies]
        newSelectedStudies.splice(addIndex, 0, unselectedStudies[removeIndex])
        setSelectedStudies(curr => [...newSelectedStudies])

        const newAvailableRounds = [...unselectedStudies]
        newAvailableRounds.splice(removeIndex, 1)
        setUnselectedStudies(curr => [...newAvailableRounds])
    }

    const handleDeselectStudy = (removeIndex: number, addIndex: number) => {
        const newAvailableRounds = [...unselectedStudies]
        newAvailableRounds.splice(addIndex, 0, selectedStudies[removeIndex])
        setUnselectedStudies(curr => [...newAvailableRounds])

        const newselectedStudies = [...selectedStudies]
        newselectedStudies.splice(removeIndex, 1)
        setSelectedStudies(curr => [...newselectedStudies])
    }

    const handleOnDragEnd = (result: DropResult) => {
        if (!result.destination) return

        else if (result.source.droppableId == "selected" && result.destination.droppableId == "selected") {
            changeStudyOrder(result.source.index, result.destination.index)
        }
        else if (result.source.droppableId == "available" && result.destination.droppableId == "selected") {
            handleSelectStudy(result.source.index, result.destination.index)
        }
        else if (result.source.droppableId == "selected" && result.destination.droppableId == "available") {
            handleDeselectStudy(result.source.index, result.destination.index)
        }
    }

    useEffect(() => {
        if (props.saveChanges)
            props.onStudiesSelected(selectedStudies)
    }, [props.saveChanges])

    return (
        <div>
            <div className="studies-header topic-header d-flex align-items-center">
                Study Programmes
                <Tooltip id="info-tooltip" place="top" style={{zIndex: "9999"}}>
                    You can select/deselect study programmes by dragging and dropping them, or by clicking on them. 
                </Tooltip>
                <FontAwesomeIcon
                    icon={faCircleInfo}
                    style={{ color: "#1976D2", marginLeft: "0.5rem" }}
                    data-tooltip-id="info-tooltip"
                    data-tooltip-place="top"
                />
                
                <Checkbox sx={{paddingRight: "2px", marginLeft: "1rem"}} onChange={handleSelectAllCheckboxChange}/>
                <span style={{fontSize: "15px"}}>Select All</span>
            </div>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <div className="study-dropbox-title">Selected study programmes</div>
                <Droppable droppableId="selected" direction="horizontal">
                    {(provided) => (
                        
                        <div
                            className={(selectedStudies.length == 0 ? "empty-container " : "") + "studies-list"}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {selectedStudies.length == 0 ? (<div className="empty-container-message">Drag study programmes here to select them!</div>) : null}
                            {selectedStudies.map((study, index) => (
                                <Draggable key={study} draggableId={study} index={index}>
                                    {(provided) => (
                                        <div
                                            className="study-element selected-study-element"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            onClick={() => handleDeselectStudy(index, unselectedStudies.length)}
                                        >
                                            {study}
                                            <FontAwesomeIcon 
                                                icon={faXmark}
                                                size="2xs"
                                                style={{ color: 'red', position: 'absolute', top: '2px', right: '2px', cursor: 'pointer' }}
                                                className="study-element-delete"
                                                onClick={() => handleDeselectStudy(index, unselectedStudies.length)}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Divider></Divider>
                <div className="study-dropbox-title">Available study programmes</div>
                <Droppable droppableId="available" direction="horizontal">
                    {(provided) => (
                        <div
                            className="studies-list"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {unselectedStudies.map((study, index) => (
                                <Draggable key={study} draggableId={study} index={index}>
                                    {(provided) => (
                                        <div
                                            className="study-element"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            onClick={() => handleSelectStudy(index, selectedStudies.length)}
                                        >
                                            {study}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}

export default StudyEdit;