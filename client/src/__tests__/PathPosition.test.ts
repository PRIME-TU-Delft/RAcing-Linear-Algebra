/**
 * Characterisation tests for PathPosition.getCheckpointPosition
 * (see REFACTORING_PLAN.md step 0.4). getPosition and getComponentProgressPoint
 * are covered in TracksPosition.test.ts.
 */
import PathPosition from "../components/RaceThemes/PathPosition"
import { Component, Point } from "../components/RaceThemes/SharedUtils"

// Rectangle 100 wide, 50 high, traced from the bottom-left corner; total length 300.
const components = [
    new Component(new Point(0, 0), new Point(100, 0), "horizontal"),
    new Component(new Point(100, 0), new Point(100, 50), "vertical"),
    new Component(new Point(100, 50), new Point(0, 50), "horizontal"),
    new Component(new Point(0, 50), new Point(0, 0), "vertical"),
]
const pathLength = 300

describe("getCheckpointPosition", () => {
    test.each([
        // [percentage, insideTracks, expected position]
        // On a horizontal piece the checkpoint is moved 55px down (outside) or up (inside).
        [0.1, false, { left: "30px", bottom: "-55px" }],
        [0.1, true, { left: "30px", bottom: "55px" }],
        // Exactly at a corner the checkpoint belongs to the earlier piece.
        [0.5, false, { left: "45px", bottom: "50px" }],
        // On a vertical piece it is moved 55px left (outside) or right (inside).
        [0.4, false, { left: "45px", bottom: "20px" }],
        [0.4, true, { left: "155px", bottom: "20px" }],
        [0.75, false, { left: "25px", bottom: "-5px" }],
    ])(
        "at %d of the path (insideTracks=%s)",
        (percentage, insideTracks, position) => {
            expect(
                PathPosition.getCheckpointPosition(
                    { name: "Checkpoint", percentage, insideTracks },
                    pathLength,
                    components
                )
            ).toEqual(position)
        }
    )
})
