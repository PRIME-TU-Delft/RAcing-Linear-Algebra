import { createContext } from "react"

interface MapDimensions {
    width: number
    height: number
}

export const MapDimensionsContext = createContext<MapDimensions>({
    width: 0,
    height: 0
})

export type { MapDimensions }