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

interface Props {
    loggedIn: boolean;
}

function LecturerPlatform(props: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!props.loggedIn) {
            // navigate("/");
        }
    }, [props.loggedIn, navigate]);


    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        RAcing Linear Algebra
                    </Typography>
                    <Tabs sx={{ flexGrow: 1 }} className="lecturer-platform-tabs">
                        <Tab label="Topics"/>
                        <Tab label="Exercises" />
                    </Tabs>
                    <IconButton color="inherit" onClick={() => navigate("/")}>
                        <FontAwesomeIcon icon={faHome} />
                    </IconButton>
                </Toolbar>
            </AppBar>
        </div>
    );
}

export default LecturerPlatform;