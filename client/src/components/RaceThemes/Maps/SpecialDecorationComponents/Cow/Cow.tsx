import React, { useEffect } from "react"
import TrainThemeSprites from "../../../Sprites/TrainThemeSprites"
import "./Cow.css"
import { DecorationElement, PercentCoordinate } from "../../../SharedUtils"
import { Button } from "react-bootstrap"

interface Props {
    decorations: DecorationElement[],
    position: PercentCoordinate
}

const TRANSITION_FRAME_DURATION = 0.15
const NEARBY_GRASS_COUNT = 3
const MOVE_SPEED = 0.0005
const EAT_DURATION = 4200

function Cow(props: Props) {
    const [currentPosition, setCurrentPosition] = React.useState<PercentCoordinate>(props.position)

    const [targetGrassPosition, setTargetGrassPosition] = React.useState<PercentCoordinate | null>(null)
    const [nearbyGrassPositions, setNearbyGrassPositions] = React.useState<PercentCoordinate[]>([])
    const [animationState, setAnimationState] = React.useState<"walking" | "eating" | "idle">("idle")
    const [transitionedToWalking, setTransitionedToWalking] = React.useState(false)

    useEffect(() => {
        findNearbyGrass()
    }, [props.decorations])

    useEffect(() => {
        if (animationState === "walking" && targetGrassPosition) {
            const interval = setInterval(() => {
            setCurrentPosition((prevPosition) => {
                const deltaX = targetGrassPosition.xPercent - prevPosition.xPercent
                const deltaY = targetGrassPosition.yPercent - prevPosition.yPercent
                const distance = Math.hypot(deltaX, deltaY)

                if (distance < MOVE_SPEED) {
                        clearInterval(interval)
                        setAnimationState("eating")
                        
                        setTimeout(() => {
                            setAnimationState("idle")
                            setTimeout(() => {
                                findNearbyGrass()
                            }, 1000)
                        }, EAT_DURATION)

                        return targetGrassPosition
                    }

                const step = MOVE_SPEED
                return distance < step
                    ? targetGrassPosition
                    : {
                        xPercent: prevPosition.xPercent + (deltaX / distance) * step,
                        yPercent: prevPosition.yPercent + (deltaY / distance) * step,
                    }
                })
            }, 1000 / 60)

            return () => clearInterval(interval)
        }
    }, [animationState, targetGrassPosition])

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * nearbyGrassPositions.length)
        if (nearbyGrassPositions.length > 0) {
            setTargetGrassPosition(nearbyGrassPositions[randomIndex])
            setAnimationState("walking")
            setTransitionedToWalking(false)
        }
    }, [nearbyGrassPositions])

    const findNearbyGrass = () => {
        const grassPositions = props.decorations
            .filter(deco => deco.class === "grass")
            .flatMap(deco => deco.points)

        // Find the closest grass positions to the cow's current position
        const sortedGrass = grassPositions.sort((a, b) => {
            const distA = Math.hypot(a.xPercent - currentPosition.xPercent, a.yPercent - currentPosition.yPercent)
            const distB = Math.hypot(b.xPercent - currentPosition.xPercent, b.yPercent - currentPosition.yPercent)
            return distA - distB
        })

        const closestGrass = sortedGrass.slice(0, NEARBY_GRASS_COUNT)
        setNearbyGrassPositions(closestGrass)
    }

    const getSpriteForState = () => {
        switch (animationState) {
            case "walking":
                if  (!transitionedToWalking) {
                    setTimeout(() => {
                        setTransitionedToWalking(true)
                    }, TRANSITION_FRAME_DURATION * 1000)
                    return TrainThemeSprites.cowTransition
                } else {
                    return TrainThemeSprites.cowWalk
                }
            case "eating":
                return TrainThemeSprites.cowEat
            case "idle":
                return TrainThemeSprites.cowStatic
            default:
                return TrainThemeSprites.cowStatic
        }
    }

    const flipBasedOnDirection = () => {
        if (animationState === "walking" && targetGrassPosition) {
            return targetGrassPosition.xPercent >= currentPosition.xPercent ? "flip-horizontal" : "normal-orientation"
        }
    }

    return (
        <div 
            className="cow-container" 
            style={{ left: `${currentPosition.xPercent * 100}%`, top: `${currentPosition.yPercent * 100}%` }}>
                <img
                    src={getSpriteForState()}
                    alt="Cow"
                    className={flipBasedOnDirection()}
                />
        </div>
    )
}

export default Cow