import { Checkpoint } from "./SharedUtils"

class Point {
    x: number
    y: number

    public constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

interface Component {
    start: Point
    end: Point
    direction: string
    length: number
}

/**
 * Creates position styling for a track component, based on its endpoints
 * @param startPoint        starting point of the component
 * @param endPoint          ending point of the component
 * @returns                 position styling (left and bottom properties) for the component piece
 */
function getPosition(startPoint: Point, endPoint: Point) {
    if (startPoint.x == endPoint.x) {
        return {
            left: `${startPoint.x}px`,
            bottom: `${Math.min(startPoint.y, endPoint.y)}px`,
        }
    } else {
        return {
            left: `${Math.min(startPoint.x, endPoint.x)}px`,
            bottom: `${startPoint.y}px`,
        }
    }
}

/**
 * Determines current position of the train for a given component piece, based on percent of progress along the component and the component length
 * @param progressPercent   current percent of progress of the train along the given component
 * @param component         the component the train is currently traversing
 * @returns                 returns the point at which the train is currently positioned
 */
function getComponentProgressPoint(
    progressPercent: number,
    component: Component
) {
    if (!component) return new Point(0, 0)

    if (component.start.x == component.end.x) {
        if (component.start.y > component.end.y)
            return new Point(
                component.start.x,
                component.start.y - progressPercent * component.length
            )
        else
            return new Point(
                component.start.x,
                component.start.y + progressPercent * component.length
            )
    } else if (component.start.x > component.end.x)
        return new Point(
            component.start.x - progressPercent * component.length,
            component.start.y
        )
    else
        return new Point(
            component.start.x + progressPercent * component.length,
            component.start.y
        )
}

/**
 * Finds the component the train is currently traversing and returns its index and percent of progress along it
 * @param progress          progress of the train along the entire path, between 0 and 1
 * @param pathLength      the total length of the path
 * @param components        the list of components of the path
 * @returns
 */
function getCurrentComponentIndexAndPercent(
    progress: number,
    pathLength: number,
    components: Component[]
) {
    let progressLength = progress * pathLength
    let index = 0
    for (let i = 0; i < components.length - 1; i++) {
        if (progressLength > components[i].length) {
            progressLength -= components[i].length
            index++
        } else break
    }

    const percent = progressLength / components[index].length
    return { index: index, percent: percent }
}

/**
 * Gets the position styling for a checkpoint based on the percent of the path it should be at
 * @param progressPercent   the progress of the path that needs to be completed to reach the checkpoint
 * @param pathLength        the total length of the path
 * @param components        list of components of the path
 * @returns     	        the position styling (left and bottom properties) for the checkpoint
 */
function getCheckpointPosition(
    checkpoint: Checkpoint,
    pathLength: number,
    components: Component[]
) {
    const currentComponent = getCurrentComponentIndexAndPercent(
        checkpoint.percentage,
        pathLength,
        components
    )
    const point = getComponentProgressPoint(
        currentComponent.percent,
        components[currentComponent.index]
    )

    if (components[currentComponent.index].direction == "vertical")
        return {
            left: `${point.x + (checkpoint.insideTracks ? 55 : -55)}px`,
            bottom: `${point.y}px`,
        }
    else
        return {
            left: `${point.x}px`,
            bottom: `${point.y + (checkpoint.insideTracks ? 55 : -55)}px`,
        }
}

export default {
    getComponentProgressPoint,
    getPosition,
    getCheckpointPosition,
}
