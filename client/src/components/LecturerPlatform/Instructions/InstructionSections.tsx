import React from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TopicsImage from '../../../img/instructions/topics.png'
import NewTopicImage from '../../../img/instructions/new-topic.png'
import GraspleExerciseImage from '../../../img/instructions/grasple-exercise.png'
import EnableEmbeddingImage from '../../../img/instructions/enable-embedding.png'
import ToggleEmbedImage from '../../../img/instructions/toggle-embed.png'
import { Alert } from '@mui/material';

export interface Section {
    id: string
    title: string
    content?: React.ReactNode
    subsections?: Section[]
}

// *** SUBSECTIONS FOR GRASPLE EMBEDDING SECTION ***

// ** First subsection: Accessing an exercise **
const accessExerciseSubsection: Section =  {
    id: "accessing-an-exercise",
    title: "1.1. Accessing an exercise",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                The first step to creating a new topic or registering a new exercise in the platform is to access the Grasple exercise you want to add. Assuming you have prepared an exercise, or you have access to an existing exercise, you can go ahead and accss it on <a href='https://www.grasple.com/' target='blank'>Grasple</a>.
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                Go ahead and navigate to the exercise of interest:
            </Typography>
            <img src={GraspleExerciseImage} alt="Accessing an exercise" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 1: Accessing an exercise on Grasple
            </Typography>
        </>
    )
}

const enableEmbeddingSubsection: Section = {
    id: "enabling-embedding",
    title: "1.2. Enabling embedding",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                Next, we want to enable embedding for this exercise. This means that Grasple will create a unique URL which can be used to access a particular exercise anonymously, like the exercise accessible <a href='https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896' target='blank'>here</a>.
            </Typography>
            <Alert severity="warning" className='instructions-section-text'>
                Embedding an exercise makes it publicly accessible. <b>DO NOT</b> embed exercises that are meant to stay private, such as exercises made for an exam.
            </Alert>
            <Typography variant='body2' className='instructions-section-text'>
                In order to embed the exercise we navigated to, in the upper-right corner click <i>More {">"} Embed Exercise</i> and then toggle the <i>enable exercise embedding</i> option, as seen below:
            </Typography>
            <img src={EnableEmbeddingImage} alt="Enabling embedding" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 2: Enable exercise embedding on Grasple
            </Typography>
            <img src={ToggleEmbedImage} alt="Toggling embedding" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 3: Toggling the embedding option
            </Typography>
             <Typography variant='body2' className='instructions-section-text'>
                Now the exercise is available to be used in the game. Note that if you ever disable embedding for an exercise, this will also make the exercise inaccessible in the game.
            </Typography>
        </>
    )
}

const copyEmbeddingSubsection: Section =  {
    id: "copying-an-embedding",
    title: "1.1. Copying the embedding",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                Finally we can go ahead and copy the snippet presented by Grasple and use it in the platform. You can either manually copy the snippet, or you can click the <i>copy embed code</i> button on the top-right of the text-box.
            </Typography>
            <Alert severity="info" className='instructions-section-text'>
                While we only need the URL of the exercise (the <i>src</i> attribute of the iframe), you can copy the entire snippet as the platform can automatically extract the URL from it.
            </Alert>
        </>
    )
}

const embeddingGraspleExercisesSection: Section = {
    id: "embedding-grasple-exercises",
    title: "1. Grasple embedding",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                In this section we go over the process of enabling embedding for a Grasple exercise, which is the first step to creating a new topic or registering a new exercise in the platform.
            </Typography>
        </>
    ),
    subsections: [
        accessExerciseSubsection,
        enableEmbeddingSubsection,
        copyEmbeddingSubsection
    ]
};

const topicsSection: Section = {
    id: "topics",
    title: "2. Topics",
    content: "This section explains how to create and manage topics.",
    subsections: [
        { id: "creating-a-new-topic", title: "2.1. Creating a new topic", content: "Placeholder for creating a new topic." },
        { id: "setting-a-name", title: "2.2. Setting a name", content: "Placeholder for setting a topic name." },
        { id: "adjusting-study-programmes", title: "2.3. Study programmes", content: "Placeholder for adjusting study programmes." },
        { id: "fake-teams", title: "2.4. Fake teams", content: "Placeholder for fake teams." },
        { id: "topic-exercises", title: "2.5. Topic Exercises", content: "Placeholder for topic exercises." },
        {
            id: "mandatory-exercises", title: "2.6. Mandatory Exercises", content: "Placeholder for mandatory exercises.",
            subsections: [
                { id: "making-exercises-mandatory", title: "2.6.1. Marking exercises", content: "Placeholder for making exercises mandatory." },
                { id: "reordering-mandatory-exercises", title: "2.6.2. Reordering", content: "Placeholder for reordering mandatory exercises." }
            ]
        },
        { id: "saving-the-topic", title: "2.7. Saving the topic", content: "Placeholder for saving the topic." }
    ]
};

const exercisesSection: Section = {
    id: "exercises",
    title: "3. Exercises",
    content: "This section covers the creation and management of exercises.",
    subsections: [
        {
            id: "creating-a-new-exercise", title: "3.1. Creating a new exercise", content: "Placeholder for creating a new exercise.",
            subsections: [
                { id: "in-the-topic", title: "3.1.1. In the topic", content: "Placeholder for creating an exercise in the topic." },
                { id: "in-the-exercises-tab", title: "3.1.2. In the exercises tab", content: "Placeholder for creating an exercise in the exercises tab." }
            ]
        },
        { id: "linking-an-existing-exercise", title: "3.2. Linking an existing exercise", content: "Placeholder for linking an existing exercise." },
        { id: "creating-a-batch-of-exercises", title: "3.3. Creating a batch of exercises", content: "Placeholder for creating a batch of exercises." }
    ]
};

export const instructionSections: Section[] = [
    embeddingGraspleExercisesSection,
    topicsSection,
    exercisesSection
];