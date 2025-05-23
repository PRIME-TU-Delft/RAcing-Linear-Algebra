import BaseBoostIcon from '../../../img/Powerups/boost-base.png'
import SteadyBoostIcon from '../../../img/Powerups/boost-steady.png'
import DaringBoostIcon from '../../../img/Powerups/boost-daring.png'
import RecklessBoostIcon from '../../../img/Powerups/boost-reckless.png'
import HelpingHandGif from '../../../img/Powerups/helping-hand.gif'

type PowerUpType = 'boost' | 'helping-hand'
interface IPowerUp {
    id: number
    name: string
    description: string
    effectDescription?: string
    duration?: number
    expiryTime?: number
    type: PowerUpType
    imageSrc: string
}

const TemplatePowerUp: IPowerUp = {
    id: -1,
    name: "Template PowerUp",
    description: "This is a template powerup.",
    type: 'boost',
    duration: 15,
    expiryTime: Date.now(),
    imageSrc: BaseBoostIcon
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
      description: "Slow but steady.",
      effectDescription: "Grants a permanent 1.1x boost to your score.",
      type: 'boost',
      imageSrc: SteadyBoostIcon
}

const DaringBoost: IPowerUp = {
      id: 2,
      name: "Daring Boost",
      description: "Risky, but rewarding.",
      effectDescription: "Grants a 1.3x boost to your score when your streak is 3 or more.",
      type: 'boost',
      imageSrc: DaringBoostIcon
}

const RecklessBoost: IPowerUp = {
      id: 3,
      name: "Reckless Boost",
      description: "Surely a bad idea, right?",
      effectDescription: "Grants a 1.8x boost to your score when your streak is 5 or more.",
      type: 'boost',
      imageSrc: RecklessBoostIcon
}

const HelpingHand: IPowerUp = {
    id: 4,
    name: "Helping Hand",
    description: "Give a boost to a random teammate!",
    type: 'helping-hand',
    imageSrc: HelpingHandGif
}

export {
    type IPowerUp,
    type PowerUpType,
    BaseBoost,
    SteadyBoost,
    DaringBoost,
    RecklessBoost,
    HelpingHand,
    TemplatePowerUp,
    HelpingHandGif
}