
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
    type PowerUpType
}