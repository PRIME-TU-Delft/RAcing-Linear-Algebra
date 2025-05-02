import BaseBoostIcon from '../../../img/Powerups/boost-base.png'
import SteadyBoostIcon from '../../../img/Powerups/boost-steady.png'
import DaringBoostIcon from '../../../img/Powerups/boost-daring.png'
import RecklessBoostIcon from '../../../img/Powerups/boost-reckless.png'

type PowerUpType = 'boost' | 'shield'
interface IPowerUp {
    id: number
    name: string
    description: string
    duration?: number
    expiryTime?: number
    type: PowerUpType
    imageSrc: string
}

const BaseBoost: IPowerUp = {
    id: 0,
    name: "Base Boost",
    description: "Activate to unlock a boost.",
    type: 'boost',
    imageSrc: BaseBoostIcon
}

const SteadyBoost: IPowerUp = {
      id: 1,
      name: "Steady Boost",
      description: "Slow but steady. Grants a permanent 1.1x boost to your score.",
      type: 'boost',
      imageSrc: SteadyBoostIcon
}

const DaringBoost: IPowerUp = {
      id: 2,
      name: "Daring Boost",
      description: "Risky, but rewarding. Grants a 1.3x boost to your score when your streak is 3 or more.",
      type: 'boost',
      imageSrc: DaringBoostIcon
}

const RecklessBoost: IPowerUp = {
      id: 3,
      name: "Reckless Boost",
      description: "Surely a bad idea, right? Grants a 1.8x boost to your score when your streak is 5 or more.",
      expiryTime: Date.now(),
      duration: 0,
      type: 'boost',
      imageSrc: RecklessBoostIcon
}

export {
    type IPowerUp,
    type PowerUpType,
    BaseBoost,
    SteadyBoost,
    DaringBoost,
    RecklessBoost
}