import React, { useEffect, useState } from "react"
import  { getZIndexValues } from "../../RaceService"
import { Dimensions, PercentCoordinate } from "../../SharedUtils"

interface Props {
    points: PercentCoordinate[]
    sprite: string
    class: string
    screenDimensions: Dimensions
    zIndex?: number
    randomSprites?: string[]
}

function Decoration(props: Props) {
    const [decorationHeight, setDecorationHeight] = useState(0)

    useEffect(() => {
        const widthRatio = props.screenDimensions.width / 1536
        switch(props.class) {
            // Old sprites
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

            // New sprites (TRAIN THEME)
            case "goudaKerk":
                setDecorationHeight(curr => widthRatio * 200)
                break
            
            case "cheese":
                setDecorationHeight(curr => widthRatio * 40)
                break
            
            case "nieuweKerk":
                setDecorationHeight(curr => widthRatio * 170)
                break
            
            case "oudeKerk":
                setDecorationHeight(curr => widthRatio * 110)
                break
            
            case "rotterdamBridge":
                setDecorationHeight(curr => widthRatio * 200)
                break

            case "bridgeRiver":
                setDecorationHeight(curr => widthRatio * 200)
                break
            
            case "thePier":
                setDecorationHeight(curr => widthRatio * 120)
                break
            
            case "seagull":
                setDecorationHeight(curr => widthRatio * 40)
                break
            
            case "cruiseShip":
                setDecorationHeight(curr => widthRatio * 40)
                break

            case "skyscraper":
                setDecorationHeight(curr => widthRatio * 180)
                break

            case "cheeseShop":
                setDecorationHeight(curr => widthRatio * 80)
                break

            default:
                setDecorationHeight(curr => 100)
        }
    }, [props.screenDimensions])
    
    // Creates position styling, setting left and bottom properties for the decoration element
    const getPositionStyle = (coordinates: PercentCoordinate) => {
        const x = coordinates.xPercent * props.screenDimensions.width
        const y = coordinates.yPercent * props.screenDimensions.height

        const baseZIndex = props.zIndex || 0

        const style = {
            left: `${x}px`,
            bottom: `${y}px`,
            zIndex: `${Math.floor(
                        baseZIndex
                    	+ (1 - coordinates.yPercent) * (getZIndexValues().decoration / 2)     
                        + (getZIndexValues().decoration / 2))   // assigning values between x/2 and x for layering purposes
                    }`
        }

        return style
    }

    const getSprite = () => {
        if (props.randomSprites && props.randomSprites.length > 0) {
            const randomIndex = Math.floor(Math.random() * props.randomSprites.length)
            return props.randomSprites[randomIndex]
        } else {
            return props.sprite
        }
    }

    return (
        <div>
            {props.points.map((coordinate) => (
                <div
                    key={props.points.indexOf(coordinate)}
                    style={{...getPositionStyle(coordinate), position: "absolute"}}
                    className={props.class + " decoration"}
                >
                    <img src={getSprite()} 
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
