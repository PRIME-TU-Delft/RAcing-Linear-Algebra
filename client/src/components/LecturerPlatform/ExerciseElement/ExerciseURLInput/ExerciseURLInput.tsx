import { TextField } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { ExistingExercisesContext } from "../../ExistingExercisesContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { Exercise } from "../../SharedUtils";

interface Props {
    url: string;
    onURLValueChange: (url: string, grasple_id: number) => void;
    onExerciseAlreadyExists: (exerciseId: number) => void;
    currentTopicExerciseIds: number[]
    autoFocus?: boolean
}

function ExerciseURLInput(props: Props) {
    const [urlValue, setUrlValue] = useState<string>(props.url);
    const [graspleId, setGraspleId] = useState<number>(-1);
    const [urlErrorMessage, setUrlErrorMessage] = useState<string>("Empty URL");
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);

    const existingExerciseIds = useContext(ExistingExercisesContext);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        setChecked(false);
        let newValue = e.target.value;

        // If the pasted value includes an iframe snippet, extract the src attribute
        if (newValue.includes("<iframe")) {
            const srcMatch = newValue.match(/src="([^"]+)"/);
            if (srcMatch && srcMatch[1]) {
                newValue = srcMatch[1];
            }
        }

        // Set the extracted URL as the textbox value
        setUrlValue(newValue);
    };

    const checkIdValue = () => {
        const idMatch = urlValue.match(/id=(\d+)$/);
        if (!idMatch) {
            return false;
        } else {
            setGraspleId(parseInt(idMatch[1]));
            return true;
        }
    };

    const hasCorrectUrlDomain = () => {
        return urlValue.includes("embed.grasple.com/exercises");
    };

    const exerciseDoesntAlreadyExist = () => {
        return (!existingExerciseIds.includes(graspleId) && !props.currentTopicExerciseIds.includes(graspleId)) || props.url === urlValue
    };

    const getIdValue = () => {
        const idMatch = urlValue.match(/id=(\d+)$/);
        return idMatch ? `#${idMatch[1]}` : "";
    };

    useEffect(() => {
        if (checked && graspleId !== -1 && !loading) {
            props.onURLValueChange(urlValue, graspleId);
        }
    }, [checked, graspleId, props, urlValue, loading]);

    useEffect(() => {
        setUrlValue(props.url);
    }, [props.url]);

    useEffect(() => {
        const correctDomain = hasCorrectUrlDomain();
        const correctId = checkIdValue();
        const isNewExercise = exerciseDoesntAlreadyExist();

        if (!correctDomain || !correctId) {
            setUrlErrorMessage("Invalid URL");
        } else if (!isNewExercise) {
            setUrlErrorMessage("Exercise already exists");
        }

        if (correctDomain && correctId && isNewExercise) {
            setChecked(true);
        } else if (correctDomain && correctId) {
            setChecked(false);
            props.onExerciseAlreadyExists(graspleId);
        } else {
            setChecked(false);
        }

        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, [urlValue, graspleId, props, existingExerciseIds]);

    return (
        <div className="d-flex row justify-content-start align-items-center" style={{ width: "100%", marginLeft: "0.5rem" }}>
            <TextField
                autoFocus={props.autoFocus}
                variant="outlined"
                size="small"
                value={urlValue}
                onChange={handleChange}
                sx={{ height: "1rem", fontSize: "13px", width: "80%" }}
                className="d-flex justify-content-center"
            />
            <div className="d-flex col" style={{ marginLeft: "0.5rem" }}>
                {loading ? (
                    <ClipLoader size={20} color={"#1976D2"} loading={loading} />
                ) : checked ? (
                    <div>
                        <FontAwesomeIcon icon={faCheckCircle} color={"#4CAF50"} />
                        <span style={{ marginLeft: "0.5rem" }}>{getIdValue()}</span>
                    </div>
                ) : (
                    <div>
                        <FontAwesomeIcon icon={faTimesCircle} color={"#c93737ff"} />
                        <span style={{ marginLeft: "0.5rem" }}>{urlErrorMessage}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExerciseURLInput;