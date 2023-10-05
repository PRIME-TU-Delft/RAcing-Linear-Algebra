import React, { useEffect, useState } from "react"
import "./StationDisplay.css"
import { a, useSpring } from "react-spring"
import { Checkpoint } from "../../SharedUtils"

interface Props {
    stations: Checkpoint[] // list of stations (checkpoints) available for the map
    points: number // current number of points
}

function StationDisplay(props: Props) {
    const filteredStations = props.stations.filter(
        (station, index) => station.points > props.points
    ) // list of stations that haven't been reached yet by the team

    const nextStationIndex =
        filteredStations.length > 0
            ? props.stations.indexOf(filteredStations[0])
            : props.stations.length - 1 // compute the index of the next station to be reached

    const [stationDisplayShown, setStationDisplayShown] = useState(
        props.stations.map((station) => false) // boolean list to determine which stations were shown
    )

    const [show, setShow] = useState(false) // boolean set to true when the display is being shown on the screen

    // When number of points changes, check whether to display the station schedule
    useEffect(() => {
        if (
            props.points >= props.stations[nextStationIndex].points - 100 &&
            !stationDisplayShown[nextStationIndex] // approaching the next station and schedule hasn't been shown yet
        ) {
            setShow((val) => true) // show station schedule
            stationDisplayShown[nextStationIndex] = true // mark the station as shown
            setStationDisplayShown([...stationDisplayShown])
            setTimeout(() => setShow((val) => false), 5000) // stop showing the schedule after 5s
        }
    }, [props.points])

    // Entrance and leave animation for the schedule, created using react-spring
    const spring = useSpring({
        config: { mass: 2, friction: 40, tension: 170 },
        from: { x: show || !stationDisplayShown[nextStationIndex] ? -400 : 0 },
        to: { x: show ? 0 : -400 },
    })

    return (
        <a.div className="station-display" style={{ ...spring }}>
            <div className="header row">
                <div className="col train-info">
                    <b>Train</b> to{" "}
                    <b>{props.stations[props.stations.length - 1].name}</b>
                </div>
                <div className="col-3 current-points">
                    <b>{props.points}</b>
                </div>
            </div>
            <div className="schedule">
                {props.stations
                    .filter((station, index) => index >= nextStationIndex)
                    .map((station, index) => (
                        <div
                            data-testid={`scheduleStation${index}`}
                            key={index}
                            className={
                                index == 0 ? "active-station" : "station"
                            }
                        >
                            {index == 0 ? (
                                <div className="next-text">Next station:</div>
                            ) : null}
                            <div className="station-info row">
                                <div className="col-2 station-points text-center">
                                    {station.points}
                                </div>
                                <div className="col station-name">
                                    {station.name}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </a.div>
    )
}

export default StationDisplay
