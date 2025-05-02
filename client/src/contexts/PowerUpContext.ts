import { createContext } from "react"
import { BoostPowerUpFunction, defaultBoostFunction } from "../components/Game/PowerUps/PowerUpFunctions"
import { IPowerUp } from "../components/Game/PowerUps/PowerUpUtils"

interface PowerUpData {
    boostPowerUpFunction: BoostPowerUpFunction,
    boost: IPowerUp,
}

export const PowerUpContext = createContext<PowerUpData>({
    boost: {} as IPowerUp,
    boostPowerUpFunction: defaultBoostFunction,
})

export type { PowerUpData }