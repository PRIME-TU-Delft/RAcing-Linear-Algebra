import { createContext } from "react"
import { StudyElement } from "../components/RaceThemes/SharedUtils"

interface LobbyData {
    topics: string[],
    studies: StudyElement[]
}

export const LobbyDataContext = createContext<LobbyData>({
    topics: [],
    studies: []
})

export type { LobbyData }