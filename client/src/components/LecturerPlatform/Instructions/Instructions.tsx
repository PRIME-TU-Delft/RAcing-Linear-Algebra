import { Divider, List, ListItem, Typography, Container, Box, Paper, Grid, Link as MuiLink } from '@mui/material';
import React, { useEffect } from 'react';
import './Instructions.css';
import TopicsImage from "../../../img/instructions/topics.png";
import NewTopicImage from "../../../img/instructions/new-topic.png";
import ExercisesOptions from '../../../img/instructions/exercises-options.png';

import { instructionSections, Section } from './InstructionSections';

function Instructions() {
    const [sections, setSections] = React.useState<Section[]>(instructionSections);

    useEffect(() => {
        setSections([...instructionSections])
    }, [instructionSections])

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Paper elevation={1} sx={{ p: 2, position: 'sticky', top: '20px' }}>
                        <Typography variant="h6" gutterBottom>Contents</Typography>
                        <List component="nav" dense>
                            {sections.map((section) => (
                                <React.Fragment key={section.id}>
                                    <ListItem sx={{ pl: 1 }}>
                                        <MuiLink href={`#${section.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                                            <Typography variant="subtitle1">{section.title}</Typography>
                                        </MuiLink>
                                    </ListItem>
                                    {section.subsections && (
                                        <List component="div" disablePadding dense>
                                            {section.subsections.map((subsection) => (
                                                <React.Fragment key={subsection.id}>
                                                    <ListItem sx={{ pl: 3 }}>
                                                        <MuiLink href={`#${subsection.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                                                            <Typography variant="body2">{subsection.title}</Typography>
                                                        </MuiLink>
                                                    </ListItem>
                                                    {subsection.subsections && (
                                                        <List component="div" disablePadding dense>
                                                            {subsection.subsections.map((subSub) => (
                                                                <ListItem key={subSub.id} sx={{ pl: 5 }}>
                                                                    <MuiLink href={`#${subSub.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                                                                        <Typography variant="caption">{subSub.title}</Typography>
                                                                    </MuiLink>
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    )}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={9}>
                    {sections.map((section) => (
                        <Box key={section.id} component="section" sx={{ mb: 5 }}>
                            <Typography 
                                variant="h4" 
                                component="h2"
                                gutterBottom 
                                id={section.id} 
                                className='instructions-section-title'
                                sx={{ scrollMarginTop: '5rem'}}>
                                {section.title}
                            </Typography>
                            {section.content}
                            <Divider sx={{ my: 2 }} />
                            {section.subsections?.map((subsection) => (
                                <Box key={subsection.id} component="article" sx={{ mb: 4, pl: 2 }}>
                                    <Typography 
                                        variant="h5" 
                                        component="h3" 
                                        gutterBottom 
                                        id={subsection.id} 
                                        className='instructions-section-title'
                                        sx={{ scrollMarginTop: '5rem'}}>
                                        {subsection.title}
                                    </Typography>
                                    {subsection.content}
                                    {subsection.subsections?.map((subSub) => (
                                         <Box key={subSub.id} component="article" sx={{ mb: 3, pl: 2 }}>
                                             <Typography 
                                                variant="h6" 
                                                component="h4" 
                                                gutterBottom 
                                                id={subSub.id} 
                                                className='instructions-section-title'
                                                sx={{ scrollMarginTop: '5rem'}}>
                                                 {subSub.title}
                                             </Typography>
                                             {/* Removed the Typography wrapper for content as it's now ReactNode */}
                                             {subSub.content}
                                         </Box>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Grid>
            </Grid>
        </Container>
    );
}

export default Instructions;