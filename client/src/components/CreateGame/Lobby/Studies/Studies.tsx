import React, { useState } from "react"
import "./Studies.css"
import { StudyElement } from "../../../RaceThemes/SharedUtils"
import { TextField, InputAdornment } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@fortawesome/free-solid-svg-icons"

interface Props {
    onSelectStudy: (study: string) => void
    onStepCompleted: () => void
    availableStudies: StudyElement[]
}

function Studies(props: Props) {
    const [selectedStudy, setSelectedStudy] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    const selectStudyHandler = (study: string) => {
        setSelectedStudy(study)
        props.onSelectStudy(study)
        props.onStepCompleted()
    }

    const studyClassHandler = (study: string) => {
        if (selectedStudy === study) return "study-selected"
        else return ""
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
    }

    const filteredStudies = props.availableStudies.filter(study =>
        study.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div>
            <div className="study-search-container">
                <TextField
                    placeholder="Search Programmes"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FontAwesomeIcon icon={faSearch} />
                            </InputAdornment>
                        )
                    }}
                    style={{marginTop: "0.5rem", width: "27em"}}
                />
            </div>   

            <div className="studies-container">
            {filteredStudies.map((study, index) => (
                <div
                    key={index}
                    className={"study-container " + studyClassHandler(study.abbreviation)}
                    onClick={() => selectStudyHandler(study.abbreviation)}
                >
                    <div className="study-title">{study.name}</div>
                    <div className="checked">&#9989;</div>
                </div>
            ))}
        </div>
        </div>
    )
}

export default Studies