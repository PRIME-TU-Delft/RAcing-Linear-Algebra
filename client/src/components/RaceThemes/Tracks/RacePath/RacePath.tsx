import React from "react";
import { Component } from "../../SharedUtils";
import TracksStyle from "../TracksStyle";
import "../Tracks.css"

interface Props {
    theme: string,
    components: Component[],
    svgPath: string
}

function RacePath(props: Props) {    
    const getRacePath = () => {
        switch(props.theme.toLowerCase()) {
            case "train":
                return props.components.map((component, index) => (
                    <div key={index}>
                        <div
                            style={TracksStyle.createComponentStyle(
                                component.start,
                                component.end,
                                index == 0,
                                index == props.components.length - 1
                            )}
                        ></div>
                        <div
                            style={TracksStyle.createRailTurnComponentStyle(
                                index,
                                props.components
                            )}
                        ></div>
                        {index == props.components.length - 1 ? (
                            <div 
                                style={TracksStyle.createFinishLineStyle(
                                    {x: component.end.x, y: component.end.y},
                                    TracksStyle.getComponentDirection(component.start, component.end),
                                )}
                            ></div>
                        ) : null}
                    </div>
                ))
            
            case "boat":
                return (<svg className="svg-path" viewBox="0 0 1920 1080" preserveAspectRatio="none">
                            <path
                                d={props.svgPath}
                                fill={"none"}
                                strokeWidth={2}
                                strokeDasharray={"15"}
                                stroke={"#3d6fadff"}
                            />
                        </svg>)
        }
    }

    return(
        <div>
            {getRacePath()}
        </div>
    )
}

export default RacePath