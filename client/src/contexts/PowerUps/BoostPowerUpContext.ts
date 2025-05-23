import { createContext } from "react"
import { BoostPowerUpFunction, defaultBoostFunction } from "../../components/Game/PowerUps/PowerUpFunctions"
import { IPowerUp } from "../../components/Game/PowerUps/PowerUpUtils"

interface BoostPowerUpData {
    boost: IPowerUp,
    playerUnlockedBoost: boolean
}

export const BoostPowerUpContext = createContext<BoostPowerUpData>({
    boost: {} as IPowerUp,
    playerUnlockedBoost: false,
})

export type { BoostPowerUpData }