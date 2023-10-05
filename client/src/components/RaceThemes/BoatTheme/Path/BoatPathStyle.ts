interface Point {
    x: number
    y: number
}

function createComponentStyle(startPoint: Point, endPoint: Point) {
    // Vertical
    if (startPoint.x == endPoint.x) {
        return {
            position: "absolute",
            left: `${startPoint.x}px`,
            bottom: `${startPoint.y}px`,
            backroundColor: "red",
            width: "3px",
        } as React.CSSProperties
    } else {
        return {
            position: "absolute",
            left: `${startPoint.x}px`,
            bottom: `${startPoint.y}px`,
            backroundColor: "red",
            height: "3px",
        } as React.CSSProperties
    }
}

export default { createComponentStyle }
