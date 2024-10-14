import React, { useEffect, useState } from "react";
import "./LecturerPlatform.css"
import { useNavigate } from "react-router-dom"

interface Props {
    loggedIn: boolean
}

function LecturerPlatform(props: Props) {
    const navigate = useNavigate()

    useEffect(() => {
        if (!props.loggedIn) {
            navigate("/")
        }
    }, [props.loggedIn])
    
    return(
        <div>
        </div>
    )
}

export default LecturerPlatform