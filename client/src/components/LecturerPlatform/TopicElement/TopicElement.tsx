import { Accordion, AccordionDetails, AccordionSummary, Divider } from "@mui/material";
import "./TopicElement.css";
import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import StudyEdit from "./StudyEdit/StudyEdit";

function TopicElement() {
    const [changingStudies, setChangingStudies] = useState<boolean>(false);
    const [studies, setStudies] = useState<string[]>(["Study 1", "Study 2", "Study 3"]);

    const studiesChangedHandler = (newStudies: string[]) => {
        setStudies(curr => [...newStudies])
        setChangingStudies(curr => false)
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
                <Divider sx={{borderBottomWidth: 3}}/>
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
                <AccordionDetails>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                </AccordionDetails>
                <AccordionDetails>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                </AccordionDetails>
                <AccordionDetails>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                    malesuada lacus ex, sit amet blandit leo lobortis eget.
                </AccordionDetails> 
            </Accordion>
        </div>
    );
}

export default TopicElement