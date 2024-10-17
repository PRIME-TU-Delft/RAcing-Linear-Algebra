import { TextField } from "@mui/material";
import React from "react";

interface Props {
    url: string
}

function ExerciseURLInput(props: Props) {
    return (
        <div className="d-flex row justify-content-start" style={{width: "100%", marginLeft: "0.5rem"}}>
            <TextField
                variant="outlined"
                size="small"
                value={props.url}
                onChange={(e) => console.log(e.target.value)}
                sx={{height: "1rem", fontSize: "13px", width: "80%"}}
            />
            
        </div>
    )
}

export default ExerciseURLInput;