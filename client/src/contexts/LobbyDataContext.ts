import { createContext } from "react"

interface LobbyData {
    topics: string[],
    studies: string[]
}

export const LobbyDataContext = createContext<LobbyData>({
    topics: [],
    studies: []
})

export type { LobbyData }