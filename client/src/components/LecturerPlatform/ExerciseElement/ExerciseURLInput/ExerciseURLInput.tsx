import { TextField } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { ExistingExercisesContext } from "../../ExistingExercisesContext";

interface Props {
    url: string
    onURLValueChange: (url: string, grasple_id: number) => void
    onExerciseAlreadyExists: (exerciseId: number) => void
}

function ExerciseURLInput(props: Props) {
    const [urlValue, setUrlValue] = useState<string>(props.url)
    const [graspleId, setGraspleId] = useState<number>(-1);
    const [urlErrorMessage, setUrlErrorMessage] = useState<string>("Empty URL")
    const [loading, setLoading] = useState(false)
    const [checked, setChecked] = useState(false)

    const existingExerciseIds = useContext(ExistingExercisesContext)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true)
        setChecked(false)
        const newValue = e.target.value
        setUrlValue(newValue)
    };

    const checkIdValue = () => {
        const idMatch = urlValue.match(/id=(\d+)$/)
        if (!idMatch) {
            return false
        } else {
            setGraspleId(parseInt(idMatch[1]))
            return true
        }
    }

    const hasCorrectUrlDomain = () => {
        return urlValue.includes("embed.grasple.com/exercises")
    }

    const exerciseDoesntAlreadyExist = () => {
        console.log(existingExerciseIds)
        return !existingExerciseIds.includes(graspleId) || props.url === urlValue
    }

    const getIdValue = () => {
        const idMatch = urlValue.match(/id=(\d+)$/)
        return idMatch ? `#${idMatch[1]}` : ""
    }

    useEffect(() => {
        if (checked && graspleId != -1) {
            props.onURLValueChange(urlValue, graspleId);
        }
    }, [checked, graspleId])

    useEffect(() => {
        setUrlValue(props.url)
    }, [props.url])

    useEffect(() => {
        const correctDomain = hasCorrectUrlDomain()
        const correctId = checkIdValue()
        const isNewExercise = exerciseDoesntAlreadyExist()

        if (!correctDomain || !correctId) {
            setUrlErrorMessage("Invalid URL")
        } 

        else if (!isNewExercise) {
            setUrlErrorMessage("Exercise already exists")
        }

        if (correctDomain && correctId && isNewExercise) {
            setChecked(true)
        } else if (correctDomain && correctId) {
            setChecked(false)
            props.onExerciseAlreadyExists(graspleId)
        } else {
            setChecked(false)
        }

        setTimeout(() => {
            setLoading(false)
        }, 500)
    }, [urlValue, graspleId])

    return (
        <div className="d-flex row justify-content-start align-items-center" style={{ width: "100%", marginLeft: "0.5rem" }}>
            <TextField
                variant="outlined"
                size="small"
                defaultValue={props.url}
                onChange={handleChange}
                sx={{ height: "1rem", fontSize: "13px", width: "80%"}}
                className="d-flex justify-content-center"
            />
            <div className="d-flex col" style={{ marginLeft: "0.5rem" }}>
                {loading ? (
                    <ClipLoader size={20} color={"#1976D2"} loading={loading} />
                ) : checked ? (
                    <div>
                        <FaCheckCircle size={20} color={"#4CAF50"} />
                        <span style={{marginLeft: "0.5rem"}}>{getIdValue()}</span>
                    </div>
                ) : (
                    <div>
                        <FaTimesCircle size={20} color={"#F44336"} />
                        <span style={{marginLeft: "0.5rem"}}>{urlErrorMessage}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExerciseURLInput;