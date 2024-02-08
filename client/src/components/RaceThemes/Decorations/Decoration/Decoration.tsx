import React, { useEffect, useState } from "react"
import { Dimensions, PercentCoordinate } from "../../SharedUtils"

interface Props {
    points: PercentCoordinate[]
    sprite: string
    class: string
    screenDimensions: Dimensions
}

function Decoration(props: Props) {
    const [decorationHeight, setDecorationHeight] = useState(0)

    useEffect(() => {
        const widthRatio = props.screenDimensions.width / 1536
        switch(props.class) {
            case "tree":
                setDecorationHeight(curr => widthRatio * 80)
                break
            case "windmill":
                setDecorationHeight(curr => widthRatio * 250)
                break

            case "lake-one":
                setDecorationHeight(curr => widthRatio * 120)
                break

            case "lake-two":
                setDecorationHeight(curr => widthRatio * 100)
                break  

            case "lilypad":
                setDecorationHeight(curr => widthRatio * 14)
                break  

            case "swamp-rock":
                setDecorationHeight(curr => widthRatio * 30)
                break

            case "swamp-plant":
                setDecorationHeight(curr => widthRatio * 50)
                break

            default:
                setDecorationHeight(curr => 100)
        }
    }, [props.screenDimensions])
    
    // Creates position styling, setting left and bottom properties for the decoration element
    const getPositionStyle = (coordinates: PercentCoordinate) => {
        const x = coordinates.xPercent * props.screenDimensions.width
        const y = coordinates.yPercent * props.screenDimensions.height
        

        const style = {
            left: `${x}px`,
            bottom: `${y}px`,
            zIndex: `${Math.floor((1 - coordinates.yPercent) * 1000)}`
        }

        return style
    }

    return (
        <div>
            {props.points.map((coordinate) => (
                <div
                    key={props.points.indexOf(coordinate)}
                    style={getPositionStyle(coordinate)}
                    className={props.class + " decoration"}
                >
                    <img src={props.sprite} 
                    style={{
                        height: `${decorationHeight}px`,
                        width: `auto`,
                    }}
                    alt="" />
                </div>
            ))}
        </div>
    )
}

export default Decoration
