import React, { useEffect, useState } from "react"
import "./StationDisplay.css"
import { a, useSpring } from "react-spring"
import { Checkpoint } from "../SharedUtils"

interface Tip {
    title: string,
    content: string
}

interface Props {
    stations: Tip[] // list of tips
    activeIndices: number[]
    nextTip: () => void
}

function StationDisplay(props: Props) {

    return (
        <a.div className="station-display">
            <div className="header row">
                <div className="col train-info">
                    <b>Tips</b>
                </div>
            </div>
            <div className="schedule">
                {props.activeIndices
                    .map((index, displayIndex) => (displayIndex == 0 ?
                        (<div
                            key={index}
                            className={"active-station"}
                        >
                            <div className="row">
                                <div className="col next-text">{props.stations[index].title}</div>
                            </div>
                            <div className="station-info row">
                                <div className="col station-name">
                                    {props.stations[index].content}
                              </div>
                            </div>
                        </div>)
                        :
                        (<div
                            key={index}
                            className={"station"}
                        >
                            <div className="row station-info">
                                <div className={"col-1 connector-container" + (displayIndex == props.activeIndices.length - 1 ? " hide-overflow" : "")}>
                                    <svg
                                        id="Layer_2"
                                        data-name="Layer 2"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 62.5 281.05"
                                        className="station-connector"
                                    >
                                        <defs>
                                        <style>
                                            {
                                            "\n      .cls-station {\n        fill: #fff;\n        stroke: #fff;\n        stroke-miterlimit: 10;\n        stroke-width: 3px;\n      }\n    "
                                            }
                                        </style>
                                        </defs>
                                        <g id="Layer_2-2" data-name="Layer 2">
                                            <circle className="cls-station" cx={48} cy={140} r={46.5} />
                                            <rect className="cls-station" x={44.87} y={1.5} width={6.63} height={278.05} />
                                        </g>
                                    </svg>
                                </div>
                                <div className="col station-name">
                                {props.stations[index].title}
                              </div>
                            </div>
                        </div>)
                     )
                    )}
            </div>
        </a.div>
    )
}

export default StationDisplay
