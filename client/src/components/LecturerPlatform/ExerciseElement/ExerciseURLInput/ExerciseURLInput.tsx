import { TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface Props {
    url: string
    onURLValueChange: (url: string, grasple_id: number) => void
}

function ExerciseURLInput(props: Props) {
    const [urlValue, setUrlValue] = useState<string>(props.url)
    const [graspleId, setGraspleId] = useState<number>(-1);
    const [loading, setLoading] = useState(false)
    const [checked, setChecked] = useState(false)

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true)
        setChecked(false)
        const newValue = e.target.value
        setUrlValue(newValue)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setLoading(false)
    };

    const checkIdValue = () => {
        const idMatch = urlValue.match(/id=(\d+)$/)
        if (!idMatch) {
            setChecked(false)
        } else {
            setGraspleId(parseInt(idMatch[1]))
            setChecked(true)
        }
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
        checkIdValue()
    }, [urlValue])

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
                        <span style={{marginLeft: "0.5rem"}}>Error</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExerciseURLInput;