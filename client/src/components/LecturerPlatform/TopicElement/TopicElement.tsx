import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import "./TopicElement.css";
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';

function TopicElement() {
    const studies = ["Study 1", "Study 2", "Study 3"];

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
                <AccordionDetails>
                    <AccordionDetails>
                        <div className="studies-section">
                            <div className="studies-header">
                                Studies <FontAwesomeIcon icon={faPen} size="xs" />
                            </div>
                            <div className="studies-list">
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {studies.map((study, index) => (
                                        <div key={index} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#fff' }}>
                                            {study}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </AccordionDetails>
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