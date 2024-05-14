import React, { useState } from "react"
import "./Themes.css"
import Theme from "./Theme/Theme"
import boatIcon from "../../../../img/boat-icon.svg"
import trainIcon from "../../../../img/train-icon.png"

interface Props {
    onSelectTheme: (theme: string) => void
    onStepCompleted: () => void
}

function Themes(props: Props) {
    const [selectedTheme, setSelectedTheme] = useState("")

    // Sets the selected theme and marks the theme step as completed
    const themeHandler = (theme: string) => {
        setSelectedTheme(theme)
        props.onSelectTheme(theme)
        props.onStepCompleted()
    }

    // Determines if a given theme should be displayed as selected
    const themeClassHandler = (theme: string) => {
        if (selectedTheme == theme) return "theme-selected"
        else return ""
    }

    return (
        <div className="themes-container">
            <Theme
                title="Train"
                description="Face the rails!"
                onSelectTheme={(theme: string) => themeHandler(theme)}
                class={themeClassHandler("Train")}
                icon={trainIcon}
            ></Theme>

            {/* <Theme
                title="Boat"
                description="Head to the sea!"
                onSelectTheme={(theme: string) => themeHandler(theme)}
                class={themeClassHandler("Boat")}
                icon={boatIcon}
            ></Theme> */}
        </div>
    )
}

export default Themes
