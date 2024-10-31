import React, { useEffect, useState } from "react";
import "./LecturerPlatform.css";
import { useNavigate } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import TopicElement from "./TopicElement/TopicElement";
import { Button } from "@mui/material";

interface Props {
    loggedIn: boolean;
}

interface Exercise {
    id: number,
    name: string,
    grasple_id: number,
    difficuly: string,
    url: string,
    numOfAttempts: number   
}

interface Topic {
    id: number,
    name: string,
    studies: string[],
    exercises: Exercise[]
}

function LecturerPlatform(props: Props) {
    const [activeTab, setActiveTab] = useState<string>("topics")
    const [topics, setTopics] = useState<Topic[]>([
        {
            id: 1,
            name: "Topic 1",
            studies: ["Study 1", "Study 2"],
            exercises: [
                {
                    id: 1,
                    name: "Exercise 1",
                    grasple_id: 7896,
                    difficuly: "Easy",
                    url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
                    numOfAttempts: 1,
                },
                {
                    id: 2,
                    name: "Exercise 2",
                    grasple_id: 7896,
                    difficuly: "Easy",
                    url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
                    numOfAttempts: 1,
                }
            ]
        },
        {
            id: 1,
            name: "Topic 2",
            studies: ["Study 2", "Study 4"],
            exercises: [
                {
                    id: 1,
                    name: "Exercise 2",
                    grasple_id: 7896,
                    difficuly: "Easy",
                    url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
                    numOfAttempts: 1,
                },
                {
                    id: 2,
                    name: "Exercise 4",
                    grasple_id: 7896,
                    difficuly: "Easy",
                    url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
                    numOfAttempts: 1,
                },
                {
                    id: 2,
                    name: "Exercise 4",
                    grasple_id: 7896,
                    difficuly: "Easy",
                    url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
                    numOfAttempts: 1,
                }
            ]
        },
        {
            id: 1,
            name: "Topic 4",
            studies: ["Study 2", "Study 4"],
            exercises: [
                {
                    id: 1,
                    name: "Exercise 2",
                    grasple_id: 7896,
                    difficuly: "Easy",
                    url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
                    numOfAttempts: 1,
                },
                {
                    id: 2,
                    name: "Exercise 4",
                    grasple_id: 7896,
                    difficuly: "Easy",
                    url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
                    numOfAttempts: 1,
                },
                {
                    id: 2,
                    name: "Exercise 4",
                    grasple_id: 7896,
                    difficuly: "Easy",
                    url: "https://embed.grasple.com/exercises/71b1fb36-e35f-4aaf-9a47-0d227c4337e2?id=77896",
                    numOfAttempts: 1,
                }
            ]
        }
    ])

    const navigate = useNavigate();

    useEffect(() => {
        if (!props.loggedIn) {
            // navigate("/");
        }
    }, [props.loggedIn, navigate]);

    const updateTopicHandler = (topicData: Topic, index: number) => {
        const newTopics = [...topics];
        newTopics[index] = topicData;
        setTopics(curr => [...newTopics]);
    }

    function discardNewTopicHandler(index: number): void {
        const newTopics = [...topics];
        newTopics.splice(index, 1);
        setTopics(curr => [...newTopics]);
    }

    const createNewTopic = () => {
        const newTopic = {
            id: -1,
            name: "New Topic",
            studies: [],
            exercises: []
        };
        const newTopics = [newTopic, ...topics];
        console.log(newTopics);
        setTopics(curr => [...newTopics]);
    }

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        RAcing Linear Algebra
                    </Typography>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleChange}
                        textColor="inherit"
                        indicatorColor="secondary"
                        className="lecturer-platform-tabs"
                    >
                        <Tab value="topics" label="Topics"/>
                        <Tab value="exercises" label="Exercises"/>
                    </Tabs>
                    <IconButton color="inherit" onClick={() => navigate("/")} style={{marginLeft: "auto"}}>
                        <FontAwesomeIcon icon={faHome} />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Button variant="outlined" style={{marginTop: "2rem", width: "80%"}} onClick={createNewTopic}>Create New Topic</Button>
            <div style={{marginBottom: "1rem"}}>
                {topics.map((topic, index) => (
                    <TopicElement 
                        key={index} 
                        id={topic.id} 
                        name={topic.name} 
                        studies={topic.studies} 
                        exercises={topic.exercises} 
                        onUpdateTopic={(topicData: Topic) => updateTopicHandler(topicData, index)}
                        discardNewTopic={() => discardNewTopicHandler(index)}
                    />
                ))}
            </div>
        </div>
    );
}

export default LecturerPlatform;