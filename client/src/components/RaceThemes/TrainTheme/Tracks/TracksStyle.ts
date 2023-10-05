import Sprites from "../TrainThemeSprites"
import Position from "../../PathPosition"

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
    isStartingComponent: boolean
) {
    const position = Position.getPosition(startPoint, endPoint)

    // Vertical
    if (startPoint.x == endPoint.x) {
        const componentHeight = Math.abs(startPoint.y - endPoint.y)
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

        if (startPoint.y > endPoint.y) {
            style.height = `${componentHeight - 40}px`
            style.bottom = `${endPoint.y + 40}px`
        } else if (!isStartingComponent) {
            style.height = `${componentHeight - 40}px`
            style.bottom = `${startPoint.y + 40}px`
        }

        return style
    }

    // Horizontal
    else if (startPoint.y == endPoint.y) {
        const componentWidth = Math.abs(startPoint.x - endPoint.x)

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

        if (startPoint.x > endPoint.x) {
            style.width = `${componentWidth - 40}px`
            style.left = `${endPoint.x + 40}px`
        } else if (!isStartingComponent) {
            style.width = `${componentWidth - 40}px`
            style.left = `${startPoint.x + 40}px`
        }

        return style
    } else return {}
}

export default { createComponentStyle, createRailTurnComponentStyle }
