interface PercentCoordinate {
    xPercent: number
    yPercent: number
}

class Point {
    x: number
    y: number

    public constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

interface AnimationStatus {
    pathProgress: number,
    transitionDuration: number, 
    timeScoreIndex: number 
}

interface Ghost {
    teamName: string
    color: string
    timeScores: { timePoint: number, score: number }[]
    checkpoints: number[]
    study: string
    accuracy: number
    animationStatus: AnimationStatus
}

interface Checkpoint {
    name: string
    points: number
}

interface Dimensions {
    width: number
    height: number
}

class Component {
    start: Point
    end: Point
    direction: string
    length: number

    calculateLength = (start: Point, end: Point) => {
        if (start.x == end.x) return Math.abs(start.y - end.y)
        else return Math.abs(start.x - end.x)
    }

    public constructor(start: Point, end: Point, direction: string) {
        this.start = start
        this.end = end
        this.direction = direction
        this.length = this.calculateLength(start, end)
    }
}

export {
    type PercentCoordinate,
    Point,
    type Checkpoint,
    Component,
    type Ghost,
    type Dimensions,
}
