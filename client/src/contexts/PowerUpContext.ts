import { createContext } from "react"
import { BoostPowerUpFunction, defaultBoostFunction } from "../components/Game/PowerUps/PowerUpFunctions"
import { IPowerUp } from "../components/Game/PowerUps/PowerUpUtils"

interface PowerUpData {
    boost: IPowerUp,
    playerUnlockedBoost: boolean
}

export const PowerUpContext = createContext<PowerUpData>({
    boost: {} as IPowerUp,
    playerUnlockedBoost: false
})

export type { PowerUpData }