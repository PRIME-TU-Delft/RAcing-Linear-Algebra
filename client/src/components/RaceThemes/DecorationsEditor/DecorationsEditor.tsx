import React, { useState } from "react"
import "./DecorationsEditor.css"

interface Props {
    decorationsList: {
        // list of decorations that can be added to the map
        class: string // the name of the css class used for the decoration
        sprite: string // the sprite to use for the decoration
        dimensions: {
            // the width and height of the decoration in pixels
            height: number
            width: number
        }
    }[]

    mapDimensions: {
        // the map dimensions in pixels
        width: number
        height: number
    }
}

interface DecorationElement {
    class: string
    sprite: string
    position: {
        xPercent: number
        yPercent: number
    }
    dimensions: {
        width: number
        height: number
    }
}

function DecorationsEditor(props: Props) {
    const [dropdown, setDropdown] = useState(false) // determines whether to display the dropdown with decorations
    const [selectedDecoration, setSelectedDecoration] = useState({
        // the current selected decoration
        class: "",
        sprite: "",
        dimensions: {
            width: 0,
            height: 0,
        },
    })
    const [placedElements, setPlacedElements] = useState<DecorationElement[]>( // the list of elements that were placed with the editor
        []
    )

    const differenceX = window.innerWidth - props.mapDimensions.width // the difference between the full screen width and the map width
    const differenceY = window.innerHeight - props.mapDimensions.height // the difference between the full screen height and the map height

    const height = props.mapDimensions.height
    const width = props.mapDimensions.width
    const showDropdown = dropdown ? " show-dropdown" : " hide-dropdown"

    // On mouse down, places the selected decoration into the array of placed elements at the clicked position on the screen
    const onMouseDown = (e: React.MouseEvent) => {
        if (selectedDecoration.class != "") {
            placedElements.push({
                class: selectedDecoration.class,
                sprite: selectedDecoration.sprite,
                position: {
                    xPercent:
                        (e.clientX - differenceX) / width -
                        selectedDecoration.dimensions.width / (2 * width),
                    yPercent:
                        1 -
                        (e.clientY - differenceY) / height -
                        selectedDecoration.dimensions.height / (2 * height),
                },
                dimensions: selectedDecoration.dimensions,
            })
            setPlacedElements([...placedElements])
            setSelectedDecoration({
                class: "",
                sprite: "",
                dimensions: {
                    width: 0,
                    height: 0,
                },
            })
        }
    }

    // Removes element from the placed elements array
    const removeElement = (decoration: DecorationElement) => {
        //console.log(selectedDecoration)
        if (selectedDecoration.class.length == 0) {
            const index = placedElements.indexOf(decoration)
            if (index > -1) {
                placedElements.splice(index, 1)
                setPlacedElements([...placedElements])
            }
        }
    }

    // Creates position styling for decoration
    const createStyle = (decoration: DecorationElement) => {
        const style = {
            bottom: decoration.position.yPercent * height,
            left: decoration.position.xPercent * width,
            width: decoration.dimensions.width,
            height: decoration.dimensions.height,
        }
        return style
    }

    // Prints the points of all selected decorations to console
    const printPointsToConsole = () => {
        for (let i = 0; i < props.decorationsList.length; i++) {
            let result = props.decorationsList[i].class + ":\npoints: [\n"

            placedElements
                .filter(
                    (element) =>
                        element.sprite == props.decorationsList[i].sprite
                )
                .map((element) => element.position)
                .forEach(
                    (position) =>
                        (result +=
                            "{xPercent: " +
                            position.xPercent.toString() +
                            ", yPercent: " +
                            position.yPercent.toString() +
                            "},\n")
                )

            result += "]"
        }
    }

    return (
        <div
            onMouseDown={(event) => onMouseDown(event)}
            className="editor-content"
        >
            <div className="selected-decoration-text">
                Selected decoration: {selectedDecoration.class}
            </div>

            <div
                className="dropdown-btn"
                onClick={() => setDropdown(!dropdown)}
            >
                SELECT DECORATION
            </div>

            <div className={"menu" + showDropdown}>
                {props.decorationsList.map((decoration) => (
                    <div
                        key={props.decorationsList.indexOf(decoration)}
                        className={"icon-container"}
                        onClick={() => setSelectedDecoration(decoration)}
                    >
                        <img
                            src={decoration.sprite}
                            alt=""
                            className="img-fluid"
                        />
                    </div>
                ))}

                <div
                    className="save-btn"
                    onClick={() => printPointsToConsole()}
                >
                    PRINT DECORATION POSITIONS TO CONSOLE
                </div>
            </div>
            {placedElements.map((decoration) => (
                <div
                    key={placedElements.indexOf(decoration)}
                    className={decoration.class + " decoration"}
                    style={createStyle(decoration)}
                    onClick={() => removeElement(decoration)}
                >
                    <img src={decoration.sprite} alt="" style={{ width: '100%', height: '100%' }} />
                </div>
            ))}
        </div>
    )
}

export default DecorationsEditor
