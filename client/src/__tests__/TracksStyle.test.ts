import TracksStyle from "../components/RaceThemes/TrainTheme/Tracks/TracksStyle"
import Sprites from "../components/RaceThemes/TrainTheme/TrainThemeSprites"
import Position from "../components/RaceThemes/PathPosition"

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
    length: number
}

interface RailTurnStyle {
    position: string
    left: string
    bottom: string
    width: string
    height: string
    backgroundImage: string
    backgroundSize: string
}

describe("Tracks style functions tests", () => {
    describe("createRailTurnComponentStyle tests", () => {
        const initialComponentUp: Component = {
            start: new Point(500, 0),
            end: new Point(500, 300),
            length: 300,
        }

        const initialComponentDown: Component = {
            start: new Point(500, 300),
            end: new Point(500, 0),
            length: 300,
        }

        const initialComponentLeft: Component = {
            start: new Point(500, 300),
            end: new Point(200, 300),
            length: 300,
        }

        const initialComponentRight: Component = {
            start: new Point(200, 300),
            end: new Point(500, 300),
            length: 300,
        }

        test("Turning right when coming from down correct", () => {
            const secondComponent: Component = {
                start: initialComponentUp.end,
                end: new Point(
                    initialComponentUp.end.x + 300,
                    initialComponentUp.end.y
                ),
                length: 300,
            }

            const result = TracksStyle.createRailTurnComponentStyle(0, [
                initialComponentUp,
                secondComponent,
            ])

            expect((result as RailTurnStyle).left).toBe(
                `${secondComponent.start.x}px`
            )
            expect((result as RailTurnStyle).bottom).toBe(
                `${secondComponent.start.y}px`
            )
            expect((result as RailTurnStyle).backgroundImage).toBe(
                `url(${Sprites.trackTopLeft})`
            )
        })

        test("Turning right when coming from up correct", () => {
            const secondComponent: Component = {
                start: initialComponentDown.end,
                end: new Point(
                    initialComponentDown.end.x + 300,
                    initialComponentDown.end.y
                ),
                length: 300,
            }

            const result = TracksStyle.createRailTurnComponentStyle(0, [
                initialComponentDown,
                secondComponent,
            ])

            expect((result as RailTurnStyle).left).toBe(
                `${secondComponent.start.x}px`
            )
            expect((result as RailTurnStyle).bottom).toBe(
                `${secondComponent.start.y}px`
            )
            expect((result as RailTurnStyle).backgroundImage).toBe(
                `url(${Sprites.trackBottomLeft})`
            )
        })

        test("Turning left when coming from down correct", () => {
            const secondComponent: Component = {
                start: initialComponentUp.end,
                end: new Point(
                    initialComponentUp.end.x - 300,
                    initialComponentUp.end.y
                ),
                length: 300,
            }

            const result = TracksStyle.createRailTurnComponentStyle(0, [
                initialComponentUp,
                secondComponent,
            ])

            expect((result as RailTurnStyle).left).toBe(
                `${secondComponent.start.x}px`
            )
            expect((result as RailTurnStyle).bottom).toBe(
                `${secondComponent.start.y}px`
            )
            expect((result as RailTurnStyle).backgroundImage).toBe(
                `url(${Sprites.trackTopRight})`
            )
        })

        test("Turning left when coming from up correct", () => {
            const secondComponent: Component = {
                start: initialComponentDown.end,
                end: new Point(
                    initialComponentDown.end.x - 300,
                    initialComponentDown.end.y
                ),
                length: 300,
            }

            const result = TracksStyle.createRailTurnComponentStyle(0, [
                initialComponentDown,
                secondComponent,
            ])

            expect((result as RailTurnStyle).left).toBe(
                `${secondComponent.start.x}px`
            )
            expect((result as RailTurnStyle).bottom).toBe(
                `${secondComponent.start.y}px`
            )
            expect((result as RailTurnStyle).backgroundImage).toBe(
                `url(${Sprites.trackBottomRight})`
            )
        })

        test("Turning up when coming from left correct", () => {
            const secondComponent: Component = {
                start: initialComponentRight.end,
                end: new Point(
                    initialComponentRight.end.x,
                    initialComponentRight.end.y + 300
                ),
                length: 300,
            }

            const result = TracksStyle.createRailTurnComponentStyle(0, [
                initialComponentRight,
                secondComponent,
            ])

            expect((result as RailTurnStyle).left).toBe(
                `${secondComponent.start.x}px`
            )
            expect((result as RailTurnStyle).bottom).toBe(
                `${secondComponent.start.y}px`
            )
            expect((result as RailTurnStyle).backgroundImage).toBe(
                `url(${Sprites.trackBottomRight})`
            )
        })

        test("Turning up when coming from right correct", () => {
            const secondComponent: Component = {
                start: initialComponentLeft.end,
                end: new Point(
                    initialComponentLeft.end.x,
                    initialComponentLeft.end.y + 300
                ),
                length: 300,
            }

            const result = TracksStyle.createRailTurnComponentStyle(0, [
                initialComponentLeft,
                secondComponent,
            ])

            expect((result as RailTurnStyle).left).toBe(
                `${secondComponent.start.x}px`
            )
            expect((result as RailTurnStyle).bottom).toBe(
                `${secondComponent.start.y}px`
            )
            expect((result as RailTurnStyle).backgroundImage).toBe(
                `url(${Sprites.trackBottomLeft})`
            )
        })

        test("Turning down when coming from left correct", () => {
            const secondComponent: Component = {
                start: initialComponentRight.end,
                end: new Point(
                    initialComponentRight.end.x,
                    initialComponentRight.end.y - 300
                ),
                length: 300,
            }

            const result = TracksStyle.createRailTurnComponentStyle(0, [
                initialComponentRight,
                secondComponent,
            ])

            expect((result as RailTurnStyle).left).toBe(
                `${secondComponent.start.x}px`
            )
            expect((result as RailTurnStyle).bottom).toBe(
                `${secondComponent.start.y}px`
            )
            expect((result as RailTurnStyle).backgroundImage).toBe(
                `url(${Sprites.trackTopRight})`
            )
        })

        test("Turning down when coming from right correct", () => {
            const secondComponent: Component = {
                start: initialComponentLeft.end,
                end: new Point(
                    initialComponentLeft.end.x,
                    initialComponentLeft.end.y - 300
                ),
                length: 300,
            }

            const result = TracksStyle.createRailTurnComponentStyle(0, [
                initialComponentLeft,
                secondComponent,
            ])

            expect((result as RailTurnStyle).left).toBe(
                `${secondComponent.start.x}px`
            )
            expect((result as RailTurnStyle).bottom).toBe(
                `${secondComponent.start.y}px`
            )
            expect((result as RailTurnStyle).backgroundImage).toBe(
                `url(${Sprites.trackTopLeft})`
            )
        })

        test("Last component doesn't have turning rails after", () => {
            const secondComponent: Component = {
                start: initialComponentLeft.end,
                end: new Point(
                    initialComponentLeft.end.x,
                    initialComponentLeft.end.y - 300
                ),
                length: 300,
            }

            const result = TracksStyle.createRailTurnComponentStyle(1, [
                initialComponentLeft,
                secondComponent,
            ])
            expect(result).toStrictEqual({})
        })
    })
})
