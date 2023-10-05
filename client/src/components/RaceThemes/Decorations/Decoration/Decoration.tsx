import React from "react"
import "./Decoration.css"
import { Dimensions, PercentCoordinate } from "../../SharedUtils"

interface Props {
    points: PercentCoordinate[]
    sprite: string
    class: string
    screenDimensions: Dimensions
}

function Decoration(props: Props) {
    // Creates position styling, setting left and bottom properties for the decoration element
    const getPositionStyle = (coordinates: PercentCoordinate) => {
        const x = coordinates.xPercent * props.screenDimensions.width
        const y = coordinates.yPercent * props.screenDimensions.height

        const style = {
            left: `${x}px`,
            bottom: `${y}px`,
        }

        return style
    }

    return (
        <div>
            {props.points.map((coordinate) => (
                <div
                    key={props.points.indexOf(coordinate)}
                    style={getPositionStyle(coordinate)}
                    className={props.class}
                >
                    <img src={props.sprite} alt="" />
                </div>
            ))}
        </div>
    )
}

export default Decoration
