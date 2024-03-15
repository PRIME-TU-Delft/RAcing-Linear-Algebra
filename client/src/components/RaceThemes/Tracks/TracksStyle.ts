import Sprites from "../Sprites/TrainThemeSprites"
import Position from "../PathPosition"
import React from "react"

interface Point {
    x: number
    y: number
}

interface Component {
    start: Point
    end: Point
    length: number
}

// Determines rail turn position and which sprite to use, based on direction the rail turn is going in
function createRailTurnComponentStyle(index: number, components: Component[]) {
    if (index != components.length - 1) {
        const currentComponent = components[index]
        const nextComponent = components[index + 1]

        const style = {
            position: "absolute",
            left: `${nextComponent.start.x}px`,
            bottom: `${nextComponent.start.y}px`,
            width: "40px",
            height: "40px",
            backgroundImage: "",
            backgroundSize: "40px 40px",
        }

        // Turning right
        if (
            currentComponent.end.y == nextComponent.end.y &&
            currentComponent.end.x < nextComponent.end.x
        ) {
            // Current component was going up
            if (currentComponent.start.y < currentComponent.end.y)
                style.backgroundImage = `url(${Sprites.trackTopLeft})`
            // Current component was going down
            else style.backgroundImage = `url(${Sprites.trackBottomLeft})`
        }

        // Turning left
        if (
            currentComponent.end.y == nextComponent.end.y &&
            currentComponent.end.x > nextComponent.end.x
        ) {
            // Current component was going up
            if (currentComponent.start.y < currentComponent.end.y)
                style.backgroundImage = `url(${Sprites.trackTopRight})`
            // Current component was going down
            else style.backgroundImage = `url(${Sprites.trackBottomRight})`
        }

        // Turning up
        if (
            currentComponent.end.x == nextComponent.end.x &&
            currentComponent.end.y < nextComponent.end.y
        ) {
            // Current component was going right
            if (currentComponent.start.x < currentComponent.end.x)
                style.backgroundImage = `url(${Sprites.trackBottomRight})`
            // Current component was going left
            else style.backgroundImage = `url(${Sprites.trackBottomLeft})`
        }

        // Turning down
        else if (
            currentComponent.end.x == nextComponent.end.x &&
            currentComponent.end.y > nextComponent.end.y
        ) {
            // Current component was going right
            if (currentComponent.start.x < currentComponent.end.x)
                style.backgroundImage = `url(${Sprites.trackTopRight})`
            // Current component was going left
            else style.backgroundImage = `url(${Sprites.trackTopLeft})`
        }

        return style
    } else return {}
}

// Creates the style for a component of the train track including its positioning and sprite
function createComponentStyle(
    startPoint: Point,
    endPoint: Point,
    isStartingComponent: boolean,
) {
    const direction = getComponentDirection(startPoint, endPoint)

    if (direction == "vertical") {
        const componentHeight = Math.abs(startPoint.y - endPoint.y)
        // Assume upwards
        const style = {
            position: "absolute",
            left: `${startPoint.x}px`,
            bottom: `${startPoint.y}px`,
            width: "40px",
            height: `${componentHeight}px`,
            backgroundImage: `url(${Sprites.trackVertical})`,
            backgroundSize: "40px auto",
            backgroundRepeat: "repeat-y",
        }

        // Check if downwards
        if (startPoint.y > endPoint.y) {
            style.height = `${componentHeight - 40}px`
            style.bottom = `${endPoint.y + 40}px`
        } 
        
        else if (!isStartingComponent) {
            style.height = `${componentHeight - 40}px`
            style.bottom = `${startPoint.y + 40}px`
        }


        return style
    }

    else if (direction == "horizontal") {
        const componentWidth = Math.abs(startPoint.x - endPoint.x)

        // Assume leftwards
        const style = {
            position: "absolute",
            left: `${startPoint.x}px`,
            bottom: `${startPoint.y}px`,
            width: `${componentWidth}px`,
            height: "40px",
            backgroundImage: `url(${Sprites.trackHorizontal})`,
            backgroundSize: "auto 40px",
            backgroundRepeat: "repeat-x",
        }

        // Check if rightwards
        if (startPoint.x > endPoint.x) {
            style.width = `${componentWidth - 40}px`
            style.left = `${endPoint.x + 40}px`
        } 
        
        else if (!isStartingComponent) {
            style.width = `${componentWidth - 40}px`
            style.left = `${startPoint.x + 40}px`
        }

        return style
    } else return {}
}

function createFinishLineStyle(startPoint: Point, direction: string) {
    const style = {
        position: "absolute",
        left: `${startPoint.x}px`,
        bottom: `${startPoint.y}px`,
        width: "22px",
        height: "40px",
        backgroundImage: `url(${direction == "vertical" ? Sprites.finishLineVertical : Sprites.finishLineHorizontal})`,
        backgroundSize: "auto 40px",
        backgroundRepeat: "repeat-x",
    } as React.CSSProperties

    return style
}

function getComponentDirection(startPoint: Point, endPoint: Point) {
    if (startPoint.x == endPoint.x) return "vertical"
    else if (startPoint.y == endPoint.y) return "horizontal"
    else return ""
}

function getLapCompletedTextPosition(endComponent: Component) {
    const direction = getComponentDirection(endComponent.start, endComponent.end)
    const style = {
        position: "absolute",
        left: `${direction == "horizontal" ? endComponent.end.x + 10 :  endComponent.end.x + 50}px`,
        bottom: `${ direction == "horizontal" ? endComponent.end.y + 50 :  endComponent.end.y + 10}px`,
        transform: "translate(-50%, 0)"
    } as React.CSSProperties

    return style
}

export default { createComponentStyle, createRailTurnComponentStyle, createFinishLineStyle, getComponentDirection, getLapCompletedTextPosition }
