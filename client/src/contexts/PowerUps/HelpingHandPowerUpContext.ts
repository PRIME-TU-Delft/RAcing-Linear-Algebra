import { createContext } from "react"
import { IPowerUp } from "../../components/Game/PowerUps/PowerUpUtils"

interface HelpingHandData {
    helpingHandReceived: boolean
    onHelpingHandBoostApplied: () => void
}

export const HelpingHandPowerUpContext = createContext<HelpingHandData>({
    helpingHandReceived: false,
    onHelpingHandBoostApplied: () => {}
})

export type { HelpingHandData }