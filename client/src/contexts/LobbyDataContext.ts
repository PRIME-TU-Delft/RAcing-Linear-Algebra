import { createContext } from "react"
import { StudyElement } from "../components/RaceThemes/SharedUtils"

export interface LobbyTopic {
    name: string,
    subject: string
}

interface LobbyData {
    topics: LobbyTopic[],
    studies: StudyElement[]
}

export const LobbyDataContext = createContext<LobbyData>({
    topics: [],
    studies: []
})

export type { LobbyData }