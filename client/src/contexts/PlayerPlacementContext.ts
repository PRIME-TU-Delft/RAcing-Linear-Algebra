import { createContext } from "react"

interface PlayerPlacement {
    showIndividualPlacements: boolean,
	placement: number
}

export const PlayerPlacementContext = createContext<PlayerPlacement>({
    showIndividualPlacements: false,
	placement: 0
})

export type { PlayerPlacement }