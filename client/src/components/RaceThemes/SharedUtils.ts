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

interface RaceObject {
    isGhost: boolean,
    ghostKey?: number,
    score: number
}

interface Ghost {
    teamName: string
    key: number
    colors: { mainColor: string, highlightColor: string}
    timeScores: { timePoint: number, score: number }[]
    checkpoints: number[]
    study: string
    accuracy: number
    lapsCompleted: number
    animationStatus: AnimationStatus
}

interface Checkpoint {
    name: string
    percentage: number
    insideTracks: boolean
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

interface DecorationElement {
    points: PercentCoordinate[]
    class: string
    sprite: string
}

interface Map {
    backgroundColor: string // the color of the background for the given theme
    decorations: DecorationElement[] // list of decorations for the map
    path: PercentCoordinate[] // list of corner points for the tracks of the train theme
}

interface ServerGhost { 
    teamName: string; 
    timeScores: { 
        timePoint: number, 
        score: number 
    }[]; 
    checkpoints: number[]; 
    study: string; 
    accuracy: number 
}

export {
    type PercentCoordinate,
    Point,
    type Checkpoint,
    Component,
    type RaceObject,
    type Ghost,
    type Dimensions,
    type Map,
    type ServerGhost
}
