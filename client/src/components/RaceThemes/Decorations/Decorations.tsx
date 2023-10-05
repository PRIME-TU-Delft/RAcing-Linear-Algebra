import React from "react"
import "./Decorations.css"
import Decoration from "./Decoration/Decoration"
import { PercentCoordinate } from "../SharedUtils"

interface DecorationElement {
    class: string
    sprite: string
    points: PercentCoordinate[]
}

interface Props {
    mapDimensions: { width: number; height: number } // the width and height of the map in px
    decorationsList: DecorationElement[] // the list of decorations to place
}

function Decorations(props: Props) {
    return (
        <div>
            {props.decorationsList.map((decoration, index) => (
                <Decoration
                    key={index}
                    points={decoration.points}
                    sprite={decoration.sprite}
                    class={decoration.class}
                    screenDimensions={props.mapDimensions}
                ></Decoration>
            ))}
        </div>
    )
}

export default Decorations
