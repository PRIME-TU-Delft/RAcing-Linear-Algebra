import BaseBoostIcon from '../../../img/Powerups/boost-base.png'
import SteadyBoostIcon from '../../../img/Powerups/boost-steady.png'
import DaringBoostIcon from '../../../img/Powerups/boost-daring.png'
import RecklessBoostIcon from '../../../img/Powerups/boost-reckless.png'

type PowerUpType = 'boost' | 'shield'
interface IPowerUp {
    id: number
    name: string
    description: string
    expiryTime: number
    type: PowerUpType
    imageSrc: string
}

export {
    type IPowerUp,
    type PowerUpType,
    BaseBoostIcon,
    SteadyBoostIcon,
    DaringBoostIcon,
    RecklessBoostIcon
}