import React from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TopicsImage from '../../../img/instructions/topics.png'
import NewTopicImage from '../../../img/instructions/new-topic.png'
import GraspleExerciseImage from '../../../img/instructions/grasple-exercise.png'
import EnableEmbeddingImage from '../../../img/instructions/enable-embedding.png'
import ToggleEmbedImage from '../../../img/instructions/toggle-embed.png'
import EditStudyProgrammesImage from '../../../img/instructions/edit-study-programmes.png'
import TopicExercisesImage from '../../../img/instructions/topic-exercises.png'
import EditingExercisesImage from '../../../img/instructions/editing-exercises.png'
import RemovingMandatoryImage from '../../../img/instructions/removing-mandatory.png'
import NewMandatoryImage from '../../../img/instructions/new-mandatory.png'
import ReorderIconImage from '../../../img/instructions/reorder-icon.png'
import ReorderVideo from '../../../img/instructions/reorder-video.gif'
import FakeTeamsWarningImage from '../../../img/instructions/fake-teams-warning.png'
import CreateTeamsButtonImage from '../../../img/instructions/create-teams-button.png'
import CreateTeams from '../../../img/instructions/create-teams.png';
import DeleteTeamsButtonImage from '../../../img/instructions/delete-teams-button.png';
import DeleteTeamsImage from '../../../img/instructions/delete-teams.png';
import AddingExerciseImage from "../../../img/instructions/adding-exercise.png"
import ExerciseUrlImage from "../../../img/instructions/exercise-url.png"
import ExerciseExistsImage from "../../../img/instructions/exercise-exists.png"
import ExerciseAddedImage from "../../../img/instructions/exercise-added.png"
import ExercisesTabImage from "../../../img/instructions/exercises-tab.png"
import LinkingExerciseVideo from '../../../img/instructions/linking-exercise.gif';
import BatchImage from "../../../img/instructions/batch.png";
import PastedImage from "../../../img/instructions/pasted.png";
import { Alert, Link } from '@mui/material';
import { set } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarsStaggered, faFileImport, faLink, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';

export interface Section {
    id: string
    title: string
    content?: React.ReactNode
    subsections?: Section[]
}

const editIcon = <FontAwesomeIcon icon={faPen} size="xs"/>
const addIcon = <FontAwesomeIcon icon={faPlus} />
const linkIcon = <FontAwesomeIcon icon={faLink} size="xs" />
const reorderIcon = <FontAwesomeIcon icon={faBarsStaggered} size="xs" style={{ marginLeft: "0.1rem"}} />
const batchIcon = <FontAwesomeIcon icon={faFileImport} size="xs" />


// *** SUBSECTIONS FOR GRASPLE EMBEDDING SECTION ***
// _____________________________________________________________________________________________________________________________________________________________________________________________--

// ** 1st subsection: Accessing an exercise **
const accessExerciseSubsection: Section =  {
    id: "accessing-an-exercise",
    title: "1.1. Accessing an exercise",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                The first step to <Link href="#creating-new-topic">creating a new topic</Link> or <Link href="#creating-exercises">registering a new exercise</Link> in the platform is to access the Grasple exercise you want to add. Assuming you have prepared an exercise, or you have access to an existing exercise, you can go ahead and accss it on <a href='https://www.grasple.com/' target='blank'>Grasple</a>.
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
// ** 2nd subsection: Enablig embedding **
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

// ** 3rd subsection: Copying an embedding **
const copyEmbeddingSubsection: Section =  {
    id: "copying-an-embedding",
    title: "1.1. Copying the embedding",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                Finally, you can go ahead and copy the snippet presented by Grasple and use it in the platform (e.g., when <Link href="#creating-exercises-in-topic">creating an exercise</Link> or <Link href="#batch-exercises">importing a batch</Link>). You can either manually copy the snippet, or you can click the <i>copy embed code</i> button on the top-right of the text-box.
            </Typography>
            <Alert severity="info" className='instructions-section-text'>
                While we only need the URL of the exercise (the <i>src</i> attribute of the iframe), you can copy the entire snippet as the platform can automatically extract the URL from it.
            </Alert>
        </>
    )
}
// _____________________________________________________________________________________________________________________________________________________________________________________________--

// *** SUBSECTIONS FOR TOPICS SECTION ***

// ** 1st subsection: Creating a new topic **
const createNewTopicSubsection: Section =  {
    id: "creating-new-topic",
    title: "2.1. Creating a new topic",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                You can begin creating a new topic by clicking the <i>Create New Topic</i> button in the top-left corner of the <i>Topics</i> tab. This will result in a blank new topic object being created, as can be seen below:
            </Typography>
            <img src={NewTopicImage} alt="New Topic" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 5: Creating a new topic
            </Typography>
        </>
    )
}


// ** 2nd subsection: Creating a new topic **
const settingTopicNameSubsection: Section =  {
    id: "setting-topic-name",
    title: "2.2. Setting topic name",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                Every topic needs to have a name, indicating the piece of content it covers. For Linear Algebra, for example, we can have topics such as <i>Eigenvalues & Eigenvectors</i>, <i>Diagonalization</i> and <i>Determinants</i>.
            </Typography>
            <Alert severity="warning" className='instructions-section-text'>
                Please don't create duplicate topic names, as it may cause confusion. You can use the search bar to check if a topic already exists. Creating multiple variants of the same topic is currently not supported, but may be possible in the future.
            </Alert>
        </>
    )
}

// ** 3rd subsection: Adjusting study programmes **
const adjustingStudyProgrammesSubsection: Section =  {
    id: "adjusting-study-programmes",
    title: "2.3. (Adjusting) Study programmes",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                Each topic can define a list of study programmes that it is relevant for. This can be useful for filtering topics by study programme when creating a game. By default, all available study programmes are selected, and it is recommended to keep it that way unless you have a specific reason to limit the topic to a subset of study programmes.
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                In case you do decide to edit the topic's study programmes, you can click the <i>edit icon {editIcon}</i>.
                You can then click on a selected study programme to remove it, as can be seen below:
            </Typography>
            <img src={EditStudyProgrammesImage} alt="Edit Studies" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 6: Edit study programmes
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                Clicking <i>Select All</i> will automatically select all available study programmes that aren't already selected. You can also drag and drop individual study programmes from the available list to the selected list.
            </Typography>
            <Alert severity="info" className='instructions-section-text'>
                Note that removing a study programme from a topic won't mean the topic is innacessible for that study programme. We don't impose such restrictions, and the study programmes simply serve as a way to filter topics more easily, which will become relevant once many topics become available in the platform.
            </Alert>
        </>
    )
}

// ** 4th subsection: Topic Exercises **
const topicExercisesSubsection: Section =  {
    id: "topic-exercises",
    title: "2.4. Topic exercises",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                Each topic contains a set of exercises which will be available to students playing the game. These exercises are sorted by difficulty, namely Easy, Medium and Hard:
            </Typography>
            <img src={TopicExercisesImage} alt="Topic Exercises" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 7: Topic exercises
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                You may notice that at the top, several mandatory exercises are listed. We will discuss <Link href="#mandatory-exercises">those next</Link>.
            </Typography>
        </>
    )
}

// ** 5.1st (sub)subsection: Making Exercises Mandatory **
const makingExercisesMandatorySubsection: Section =  {
    id: "making-exercises-mandatory",
    title: "2.4.1. Making exercises mandatory",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                In order to make an exercise mandatory for a given topic, you will need to edit the exercises. You can do this by clicking the <i>edit icon {editIcon}</i> next to the exercises subsection, which will result in the following view:
            </Typography>
            <img src={EditingExercisesImage} alt="Editing Exercises" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 8: Editing exercises
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                You can now edit the exercise you want to make mandatory (or remove the mandatory status from an existing mandatory exercise) by clicking the <i>edit icon {editIcon}</i> next to the exercise. This will show the following view:
            </Typography>
            <img src={RemovingMandatoryImage} alt="Removing Mandatory" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 9: Editing an exercise from the list that currently isn't mandatory
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                Toggling the mandatory option and saving the exercise will make the exercise appear as mandatory in the topic:
            </Typography>
            <img src={NewMandatoryImage} alt="New Mandatory" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 10: Exercise #77872 is now a mandatory exercise for the topic
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                The same logic applies when removing the mandatory status from an exercise. You can click the <i>edit icon {editIcon}</i> next to the mandatory exercise, and then toggle the mandatory option off. This will remove the exercise from the mandatory exercises list after saving.
            </Typography>
        </>
    )
}

// ** 5.2nd (sub)subsection: Ordering Mandatory Exercises **
const reorderingMandatoryExercisesSubsection: Section =  {
    id: "reordering-mandatory-exercises",
    title: "2.4.2. Reordering mandatory exercises",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                As previously mentioned, mandatory exercises are presented to the students in the order they are listed in the topic. This means that you can reorder the mandatory exercises by dragging and dropping them in the list.
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                Again, start by editing the topic exercises by clicking the <i>edit icon {editIcon}</i> next to the exercises subsection. You can then select the <i>reorder icon {reorderIcon}</i>, as can be seen below:
            </Typography>
            <img src={ReorderIconImage} alt="Reorder Icon" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 11: Reorder icon in the editing menu
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                After clicking the icon you will be able to drag and drop the mandatory exercises in the list in the preferred order, as can be seen below:
            </Typography>
            <img src={ReorderVideo} alt="Reordering Mandatory Exercises" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 12: Reordering mandatory exercises
            </Typography>
        </>
    )
}

// ** 5th subsection: Mandatory Exercises **
const mandatoryExercisesSubsection: Section =  {
    id: "mandatory-exercises",
    title: "2.5. Mandatory exercises",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                Mandatory exercises are exercises which are considered the entry-level exercises for the topic, which any student should be able to solve. A topic isn't required to have any mandatory exercises, <i>but it is recommended to have 2-3 mandatory exercises per topic</i>.
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                The difference between a mandatory exercise and a regular exercise is in how they are presented to the students in the game. The game loop is as follows:
            </Typography>
            <List>
                <ListItem className='instructions-list-item'>
                    1. At the start of the game, all students are presented with the topic's mandatory exercises, in the same order as they are listed in the topic.
                </ListItem>
                <ListItem className='instructions-list-item'>
                    2. Once all mandatory exercises are solved, the game will allow students to choose a difficulty of their next question (selection reoccurs after each new question).
                </ListItem>
                <ListItem className='instructions-list-item'>
                    3. Students will continue getting random questions from the selected difficulties until the game ends, or they run out of questions in the topic.
                </ListItem>
            </List>
        </>
    ),
    subsections: [
        makingExercisesMandatorySubsection,
        reorderingMandatoryExercisesSubsection
    ]
}

// ** 6th subsection: Mandatory Exercises **
const savingTopicSection: Section =  {
    id: "saving-topic",
    title: "2.6. Saving the topic",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                Once you are happy with the contents of the topic, you can go ahead and save it. There are two ways of doing this:
            </Typography>
            <List>
                <ListItem className='instructions-list-item'>
                    1. Save all unsaved changes at once by clicking the Save button in the bottom-right corner of the page. (Recommended)
                </ListItem>
                <ListItem className='instructions-list-item'>
                    2. Click the Save button for each individual section you edited (i.e. name, study programmes, exercises, etc.)
                </ListItem>
            </List>
        </>
    )
}

// ** 7.1st (sub)subsection: Creating Fake Teams **
const creatingFakeTeamsSubsection: Section =  {
    id: "creating-fake-teams",
    title: "2.7.1. Creating fake teams",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                You can create fake teams by clicking the <i>edit icon {editIcon}</i> next to the Fake Teams subsection. This will show the following view:
            </Typography>
            <img src={CreateTeamsButtonImage} alt="Create Teams Button" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 13: Create teams button
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                You can then click the <i>Create Fake Teams</i> button, which will allow you to configure the teams you are creating. Namely, you can specify:
            </Typography>
            <List>
                <ListItem className='instructions-list-item'>
                    1. The number of teams to create (up to 31).
                </ListItem>
                <ListItem className='instructions-list-item'>
                    2. The average (expected) time it takes to solv an exercise in this topic (in seconds). This is used to balance the distribution of teams, according to the estimated difficulty of the topic based on the selected time.
                </ListItem>
            </List>
            <img src={CreateTeams} alt="Create Teams" className='instructions-image image-medium' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 14: Creating fake teams
            </Typography>
        </>
    )
}

// ** 7.2nd (sub)subsection: Deleting Fake Teams **
const deletingFakeTeamsSubsection: Section =  {
    id: "deleting-fake-teams",
    title: "2.7.2. Deleting fake teams",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                Similaly, you can delete fake teams by clicking the <i>edit icon {editIcon}</i> next to the Fake Teams subsection. This will show the following view:
            </Typography>
            <img src={DeleteTeamsButtonImage} alt="Delete Teams Button" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 15: Delete teams button
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                Clicking this button will show you a confirmation dialog, indicating how many real teams will remain if the fake teams are deleted.
            </Typography>
            <img src={DeleteTeamsImage} alt="Delete Teams" className='instructions-image image-medium' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 16: Delete teams confirmation dialog
            </Typography>
             <Typography variant='body2' className='instructions-section-text'>
                If you confirm the deletion, all fake teams will be automatically deleted, and the topic will no longer have any fake teams associated with it.
            </Typography>
        </>
    )
}

// ** 7th subsection: Fake teams **
const fakeTeamsSubsection: Section =  {
    id: "fake-teams",
    title: "2.7. Fake teams",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                Considering the game is a race, it would be quite underwhelming if there were no teams to race against. For this reason, it is possible to generate fake (artifically generated) teams, which will populate the race and make things more interesting.
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                These teams only serve as placeholers until the topic has been played enough by real classes, at which point the fake teams can easily be <Link href="#deleting-fake-teams">deleted from the database</Link>.
            </Typography>
            <Alert severity="info" className='instructions-section-text'>
                You can create up to 31 fake teams for a topic. Fake team cannot be created until after you have saved the topic, so this is a post-creation step!
            </Alert>
            <Typography variant='body2' className='instructions-section-text'>
                If no students have played the topic yet, you will see a warning in the topic overview, as can be seen below:
            </Typography>
            <img src={FakeTeamsWarningImage} alt="Fake Teams Warning" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 13: Fake teams warning
            </Typography>
        </>
    ),
    subsections: [
        creatingFakeTeamsSubsection,
        deletingFakeTeamsSubsection
    ]
}
// _____________________________________________________________________________________________________________________________________________________________________________________________--

// *** SUBSECTIONS FOR EXERCISES SECTION ***

// ** 1.1st (sub)subsection: Creating In Topic **
const inTopicExerciseSubsection: Section =  {
    id: "creating-exercises-in-topic",
    title: "3.1 In the topic",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                To create a new exercise directly in a topic, open the <i>Topics</i> tab, navigate to the topic of choice and click the <i>edit icon {editIcon}</i> next to the Exercises subsection. You can then click the <i>"+" icon {addIcon}</i> to create a new exercise, which will result in a blank exercise object:
            </Typography>
            <img src={AddingExerciseImage} alt="Adding exercise" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 17: Creating new exercise in a topic directly
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                You can now paste the embedding snippet you copied from Grasple into the URL field:
            </Typography>
            <img src={ExerciseUrlImage} alt="URL exercise" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 18: Exercise after pasting the Grasple snippet into the URL field.
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                The platform will check the URL is valid and whether the exercise already exists in the system. If it does, you will see the following:
            </Typography>
            <img src={ExerciseExistsImage} alt="Exercise exists" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 19: Exercise already exists, so you can import its metadata instead of recreating it.
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                Next, you should select the difficulty for the new exercise (default is Easy). This can be done via the dropdown below the URL field.
            </Typography>
            <Alert severity='info' className='instructions-section-text'>
                You also have the option to choose a name for the exercise, but this is not required. By default, an exercises name is set to "Exercise #ID", where ID is the exercise's Grasple ID.
            </Alert>
            <Typography variant='body2' className='instructions-section-text'>
                When you are happy with the execise informatio, click save and it will automatically be saved both in the system and in the topic's list of exercises:
            </Typography>
            <img src={ExerciseAddedImage} alt="Exercise added" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 20: Exercise successfully saved to the topic.
            </Typography>
        </>
    )
}

// ** 1.2nd (sub)subsection: Creating In Exercises Tab **
const inExercisesTabSubsection: Section =  {
    id: "creating-exercises-in-tab",
    title: "3.2 In the Exercises tab",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                An alternate way of creating an exercise can be achieved by navigating to the <i>Exercises</i> tab. You can then click the <i>Create New Exercise</i> button located in the top left, which will create a new empty exercise object:
            </Typography>
            <img src={ExercisesTabImage} alt="Exercise tab" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 21: Creating an exercise in the exercises tab.
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                From here, the steps are the same as <Link href="#creating-exercises-in-topic">before</Link>. Once you are happy, click save and you are done!
            </Typography>
        </>
    )
}

// ** 1st subsection: Creating a new exercise **
const creatingExerciseSubsection: Section =  {
    id: "creating-exercises",
    title: "3.1 Creating a new Exercise",
    content: (
        <>
           <Typography variant='body2' className='instructions-section-text'>
                In order to create a new exercise, you will need to copy the corresponding exercise Grasple embedding. With this ready, you have two ways of creating an exercise:
            </Typography>
            <List>
                <ListItem className='instructions-list-item'>
                    1. <Link href="#creating-exercises-in-topic">In the topic directly</Link>: this is convenient when creating a new exercise specifically for a given topic. It automatically both registers the exercise within the platform and links it to the topic.
                </ListItem>
                <ListItem className='instructions-list-item'>
                    2. <Link href="#creating-exercises-in-tab">In the exercises tab</Link>: here you can make new exercises in a vacuum; When you create an exercise here it isn't linked to any topic to start off with. You can easily <Link href="#linking-exercises">link it to a topic later, as we'll see</Link>.
                </ListItem>
            </List>
        </>
    ),
    subsections: [
        inTopicExerciseSubsection,
        inExercisesTabSubsection
    ]
}

// ** 2nd subsection: Linking an exercise **
const linkingExerciseSubsection: Section =  {
    id: "linking-exercises",
    title: "3.2 Linking an existing exercise",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                If an exercise already exists in the system, you can link it to a topic by clicking the <i>link icon {linkIcon}</i> next to the <i>Exercises</i> subsection in the topic view. This will show you a list of all exercises currently available in the system, as can be seen below:
            </Typography>
            <img src={LinkingExerciseVideo} alt="Linking exercise" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 22: Linking an existing exercise to a topic
            </Typography>
        </>
    )
}

// ** 3rd subsection: Create a batch **
const batchExercisesSubsection: Section =  {
    id: "batch-exercises",
    title: "3.3 Creating a batch of exercises",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                Finally, for convenience, there is an option to create multiple exercises at once (i.e. a batch of exercises). First copy multiple Grasple embeddings into your notepad, and then copy them all at once. Now select the <i>batch import icon {batchIcon}</i>:
            </Typography>
            <img src={BatchImage} alt="Batch import" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 23: Batch import icon
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                As you can see, you are prompted with a dialogue that asks you to select the difficulty of the batch of exercises you are creating as well as a textbox where you can paste the Grasple snippets.
            </Typography>
            <Alert severity='info' className='instructions-section-text'>
                Note that the batch import will only work if all the exercises you are importing have the same difficulty. If you want to import exercises of different difficulties, you will need to do it one by one.
            </Alert>
            <Typography variant='body2' className='instructions-section-text'>
                Go ahead and paste in the snippets you copied from Grasple:
            </Typography>
            <img src={PastedImage} alt="Pasted exercises" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 24: Pasted exercises in the batch import dialogue
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                Once you paste the snippets, click the <i>Create</i> button. The exercises will be autmatically created and added to the topic.
            </Typography>
        </>
    )
}

// _____________________________________________________________________________________________________________________________________________________________________________________________--

// *** INSTRUCTION SECTIONS ***

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
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                In this section we explain how the topics are constructed and created in the platform. Topics correspond to rounds in the game, and they consist of a set of exercises that are presented to the students during the race. Solving the exercises gives points, thus increasing the progress of the team in the race.
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                Navigate to the <i>Topics</i> tab to see the list of topics currently available in the platform:
            </Typography>
            <img src={TopicsImage} alt="Topics" className='instructions-image' />
            <Typography variant='caption' className='instructions-image-caption'>
                Figure 4: Topics tab
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                You can inspect an individual topic by clicking on it, which will expand it and give you more information. In the collapsed form, you can see the most important overview information, such as its name and the number of exercises it contains.
            </Typography>
            <Typography variant='body2' className='instructions-section-text'>
                You can either create a new topic or edit an existing one. We will only cover creating a new topic here, as editing an existing topic follows suit in terms of steps.
            </Typography>
        </>
    ),
    subsections: [
        createNewTopicSubsection,
        settingTopicNameSubsection,
        adjustingStudyProgrammesSubsection,
        topicExercisesSubsection,
        mandatoryExercisesSubsection,
        savingTopicSection,
        fakeTeamsSubsection
    ]
};

const exercisesSection: Section = {
    id: "exercises",
    title: "3. Exercises",
    content: (
        <>
            <Typography variant='body2' className='instructions-section-text'>
                In this section we explain how exercises are handled in the platfom. This includes creating new exercises, linking an existing exercise to a topic and importing a batch of exercises at once for convenience.
            </Typography>
        </>
    ),
    subsections: [
        creatingExerciseSubsection,
        linkingExerciseSubsection,
        batchExercisesSubsection
    ]
};

export const instructionSections: Section[] = [
    embeddingGraspleExercisesSection,
    topicsSection,
    exercisesSection
];