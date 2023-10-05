import TracksPosition from "../components/RaceThemes/PathPosition"

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

describe("Tracks position functions tests", () => {
    describe("getPosition tests", () => {
        test("Gets correct position for vertical component", () => {
            expect(
                TracksPosition.getPosition(new Point(1, 2), new Point(1, 4))
            ).toStrictEqual({
                left: "1px",
                bottom: "2px",
            })
        })

        test("Gets correct position for horizontal component", () => {
            expect(
                TracksPosition.getPosition(new Point(1, 2), new Point(3, 2))
            ).toStrictEqual({
                left: "1px",
                bottom: "2px",
            })
        })
    })

    describe("getComponentProgressPoint tests", () => {
        const componentVerticalDown: Component = {
            start: new Point(200, 200),
            end: new Point(200, 2),
            direction: "vertical",
            length: 100,
        }

        const componentVerticalUp: Component = {
            start: new Point(200, 2),
            end: new Point(200, 200),
            direction: "vertical",
            length: 100,
        }

        const componentHorizontalLeft: Component = {
            start: new Point(200, 200),
            end: new Point(2, 200),
            direction: "horizontal",
            length: 100,
        }

        const componentHorizontalRight: Component = {
            start: new Point(2, 200),
            end: new Point(200, 200),
            direction: "horizontal",
            length: 100,
        }

        test("Vertical component in upwards direction correct for certain percent progress", () => {
            expect(
                TracksPosition.getComponentProgressPoint(
                    0.5,
                    componentVerticalUp
                )
            ).toEqual(
                new Point(
                    componentVerticalUp.start.x,
                    componentVerticalUp.start.y +
                        0.5 * componentVerticalUp.length
                )
            )
        })

        test("Vertical component in downwards direction correct for certain percent progress", () => {
            expect(
                TracksPosition.getComponentProgressPoint(
                    0.5,
                    componentVerticalDown
                )
            ).toEqual(
                new Point(
                    componentVerticalDown.start.x,
                    componentVerticalDown.start.y -
                        0.5 * componentVerticalDown.length
                )
            )
        })

        test("Horizontal component in leftwards direction correct for certain percent progress", () => {
            expect(
                TracksPosition.getComponentProgressPoint(
                    0.5,
                    componentHorizontalLeft
                )
            ).toEqual(
                new Point(
                    componentHorizontalLeft.start.x -
                        0.5 * componentHorizontalLeft.length,
                    componentHorizontalLeft.start.y
                )
            )
        })

        test("Horizontal component in leftwards direction correct for certain percent progress", () => {
            expect(
                TracksPosition.getComponentProgressPoint(
                    0.5,
                    componentHorizontalRight
                )
            ).toEqual(
                new Point(
                    componentHorizontalRight.start.x +
                        0.5 * componentHorizontalRight.length,
                    componentHorizontalRight.start.y
                )
            )
        })
    })
})
