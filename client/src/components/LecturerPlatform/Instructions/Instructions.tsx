import { Divider, List, ListItem, Typography, Container, Box, Paper, Grid, Link as MuiLink, useTheme, alpha } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import './Instructions.css'
import TopicsImage from "../../../img/instructions/topics.png"
import NewTopicImage from "../../../img/instructions/new-topic.png"
import ExercisesOptions from '../../../img/instructions/exercises-options.png'

import { instructionSections, Section } from './InstructionSections'

function Instructions() {
    const [sections, setSections] = useState<Section[]>(instructionSections)
    const theme = useTheme()
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

    const allNavigableItems = useMemo(() => {
        const items: { id: string, elementId: string, level: number }[] = []
        sections.forEach(section => {
            items.push({ id: section.id, elementId: section.id, level: 0 })
            section.subsections?.forEach(subsection => {
                items.push({ id: subsection.id, elementId: subsection.id, level: 1 })
                subsection.subsections?.forEach(subSub => {
                    items.push({ id: subSub.id, elementId: subSub.id, level: 2 })
                })
            })
        })
        return items
    }, [sections])

    useEffect(() => {
        setSections([...instructionSections])
    }, [instructionSections])

    useEffect(() => {
        const handleScroll = () => {
            const scrollThreshold = 100
            let newActiveId: string | null = null

            // Iterate from bottom-most section upwards
            for (let i = allNavigableItems.length - 1; i >= 0; i--) {
                const item = allNavigableItems[i]
                const element = document.getElementById(item.elementId)
                if (element) {
                    const rect = element.getBoundingClientRect()
                    // If the top of the element is at or above the scrollThreshold, it's a candidate
                    if (rect.top <= scrollThreshold) {
                        newActiveId = item.id
                        break // Found the current active section
                    }
                }
            }

            // If no section is found by the above (e.g., scrolled to the very top, above all sections)
            // default to the first section if it exists and is visible.
            if (!newActiveId && allNavigableItems.length > 0) {
                const firstItem = allNavigableItems[0]
                const firstElement = document.getElementById(firstItem.elementId)
                if (firstElement) {
                    const firstRect = firstElement.getBoundingClientRect()
                    // Check if the first element is visible near the top
                    if (firstRect.bottom > 0 && firstRect.top < window.innerHeight / 2) {
                         newActiveId = firstItem.id
                    }
                }
            }
            setActiveSectionId(newActiveId)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Call on mount to set initial active section

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [allNavigableItems]) // Rerun if the list of navigable items changes

    const getNavItemStyles = (itemId: string, basePaddingLeft: number) => {
        const isActive = itemId === activeSectionId;
        return {
            paddingLeft: isActive ? theme.spacing(basePaddingLeft - 0.375) : theme.spacing(basePaddingLeft), // 3px border -> 0.375 * 8px spacing unit
            backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
            borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : `3px solid transparent`,
            transition: 'background-color 0.2s ease-in-out, border-left 0.2s ease-in-out, padding-left 0.2s ease-in-out',
            '&:hover': {
                backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.text.primary, 0.04),
            },
        };
    };

    const getNavTextStyles = (itemId: string) => {
        const isActive = itemId === activeSectionId;
        return {
            color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
            fontWeight: isActive ? '600' : '400',
            transition: 'color 0.2s ease-in-out, font-weight 0.2s ease-in-out',
        };
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} className='instructions-container'>
            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Paper elevation={1} sx={{ p: 2, position: 'sticky', top: '20px', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
                        <Typography variant="h6" gutterBottom sx={{ pl: 1}}>Contents</Typography>
                        <List component="nav" dense>
                            {sections.map((section) => (
                                <React.Fragment key={section.id}>
                                    <ListItem sx={getNavItemStyles(section.id, 1)}>
                                        <MuiLink href={`#${section.id}`} sx={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                                            <Typography variant="subtitle1" sx={getNavTextStyles(section.id)}>{section.title}</Typography>
                                        </MuiLink>
                                    </ListItem>
                                    {section.subsections && (
                                        <List component="div" disablePadding dense>
                                            {section.subsections.map((subsection) => (
                                                <React.Fragment key={subsection.id}>
                                                    <ListItem sx={getNavItemStyles(subsection.id, 3)}>
                                                        <MuiLink href={`#${subsection.id}`} sx={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                                                            <Typography variant="body2" sx={getNavTextStyles(subsection.id)}>{subsection.title}</Typography>
                                                        </MuiLink>
                                                    </ListItem>
                                                    {subsection.subsections && (
                                                        <List component="div" disablePadding dense>
                                                            {subsection.subsections.map((subSub) => (
                                                                <ListItem key={subSub.id} sx={getNavItemStyles(subSub.id, 5)}>
                                                                    <MuiLink href={`#${subSub.id}`} sx={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                                                                        <Typography variant="caption" sx={getNavTextStyles(subSub.id)}>{subSub.title}</Typography>
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
    )
}

export default Instructions