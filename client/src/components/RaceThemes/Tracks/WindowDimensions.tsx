import { useState, useEffect } from "react"

// Gets current window dimnesions
function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window
    return {
        width,
        height,
    }
}

// Dynamically gets window dimensions
export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(
        getWindowDimensions()
    )

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions())
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return windowDimensions
}
