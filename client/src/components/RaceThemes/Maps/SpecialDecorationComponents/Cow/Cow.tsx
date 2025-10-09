import React, { useContext, useEffect } from "react"
import TrainThemeSprites from "../../../Sprites/TrainThemeSprites"
import "./Cow.css"
import { DecorationElement, PercentCoordinate } from "../../../SharedUtils"
import { Button } from "react-bootstrap"
import { MapDimensionsContext } from "../../../../../contexts/MapDimensionsContext"

interface Props {
    decorations: DecorationElement[],
    position: PercentCoordinate,
    id: number
}

const TRANSITION_FRAME_DURATION = 0.15
const NEARBY_GRASS_COUNT = 4
const MOVE_SPEED = 0.0005
const EAT_DURATION = 4200
const IDLE_ANIMATION_DURATION = 1000
const MAX_IDLE_CYCLES = 3

function Cow(props: Props) {
    const [currentPosition, setCurrentPosition] = React.useState<PercentCoordinate>(props.position)
    const [targetGrassPosition, setTargetGrassPosition] = React.useState<PercentCoordinate | null>(null)
    const [nearbyGrassPositions, setNearbyGrassPositions] = React.useState<PercentCoordinate[]>([])
    const [animationState, setAnimationState] = React.useState<"walking" | "eating" | "idle">("idle")
    const [transitionedToWalking, setTransitionedToWalking] = React.useState(false)
    const [animationCycleId, setAnimationCycleId] = React.useState(0)
    const [spriteSize, setSpriteSize] = React.useState({ width: 0, height: 0 });

    const [initialDelayPassed, setInitialDelayPassed] = React.useState(false)
    const [flipSpriteClass, setFlipSpriteClass] = React.useState<"normal-orientation" | "flip-horizontal">("normal-orientation")
    
    const mapDimensions = useContext(MapDimensionsContext)

    const handleSpriteLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        setSpriteSize({ width: naturalWidth, height: naturalHeight });
    };

    useEffect(() => {
        const delay = Math.random() * MAX_IDLE_CYCLES * IDLE_ANIMATION_DURATION
        const timer = setTimeout(() => {
            setInitialDelayPassed(true)
        }, delay)

        return () => clearTimeout(timer)
    }, [props.decorations])

    useEffect(() => {
        if (animationState === "walking" && targetGrassPosition) {
            setFlipSpriteClass(targetGrassPosition.xPercent > currentPosition.xPercent ? "flip-horizontal" : "normal-orientation")
        }
    }, [animationState, targetGrassPosition])

    useEffect(() => {

        if (animationState === "eating") {
            const timer = setTimeout(() => {
                setAnimationState("idle")
            }, EAT_DURATION)
            return () => clearTimeout(timer)
        }

        if (animationState == "idle" && initialDelayPassed) {
            const idleDuration = Math.random() * MAX_IDLE_CYCLES * IDLE_ANIMATION_DURATION
            const timer = setTimeout(() => {
                findNearbyGrass()
            }, idleDuration)
            return () => clearTimeout(timer)
        }

        if (animationState === "walking" && targetGrassPosition) {
            const interval = setInterval(() => {
            setCurrentPosition((prevPosition) => {
                const deltaX = targetGrassPosition.xPercent - prevPosition.xPercent
                const deltaY = targetGrassPosition.yPercent - prevPosition.yPercent
                const distance = Math.hypot(deltaX, deltaY)

                if (distance < MOVE_SPEED) {
                        clearInterval(interval)
                        setAnimationState("eating")
                        setAnimationCycleId(prevId => prevId + 1)
                        setTargetGrassPosition(null)

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
    }, [animationState, targetGrassPosition, initialDelayPassed])

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * nearbyGrassPositions.length)
        if (nearbyGrassPositions.length > 0) {
            const position = {
                xPercent: nearbyGrassPositions[randomIndex].xPercent,
                yPercent: nearbyGrassPositions[randomIndex].yPercent
            }

            if (position.xPercent - currentPosition.xPercent > (spriteSize.width / mapDimensions.width) * 0.5) {
                position.xPercent = position.xPercent - (spriteSize.width / mapDimensions.width) * 0.5
            }

            setTargetGrassPosition(position)
            setAnimationState("walking")
            setTransitionedToWalking(false)
        }
    }, [nearbyGrassPositions])

    const findNearbyGrass = () => {
        const grassPositions = props.decorations
            .filter(deco => deco.class === "grass")
            .flatMap(deco => deco.points)

        let offset = 0
        if (flipSpriteClass == "flip-horizontal") {
            console.log("Flipping back to normal orientation")
            offset = (spriteSize.width / mapDimensions.width) * 0.5
        }

        // Find the closest grass positions to the cow's current position
        const sortedGrass = grassPositions.sort((a, b) => {
            const distA = Math.hypot(a.xPercent - currentPosition.xPercent - offset, a.yPercent - currentPosition.yPercent + (spriteSize.height / mapDimensions.height) * 0.25)
            const distB = Math.hypot(b.xPercent - currentPosition.xPercent - offset, b.yPercent - currentPosition.yPercent + (spriteSize.height / mapDimensions.height) * 0.25)
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
                    return `${TrainThemeSprites.cowWalk}?id=${props.id}&cycle=${animationCycleId}`
                }
            case "eating":
                return `${TrainThemeSprites.cowEat}?id=${props.id}&cycle=${animationCycleId}`
            case "idle":
                    return `${TrainThemeSprites.cowIdle}?id=${props.id}&cycle=${animationCycleId}`
            default:
                    return `${TrainThemeSprites.cowIdle}?id=${props.id}&cycle=${animationCycleId}`
        }
    }

    const getPositionStyle = () => {
        const x = currentPosition.xPercent * mapDimensions.width;
        const y = currentPosition.yPercent * mapDimensions.height;
        return { left: `${x}px`, bottom: `${y}px` }
    }

    return (
        <div 
            className="cow-container" 
            style={getPositionStyle()}>
                <img
                    onLoad={handleSpriteLoad}
                    src={getSpriteForState()}
                    alt="Cow"
                    className={flipSpriteClass}
                />
        </div>
    )
}

export default Cow