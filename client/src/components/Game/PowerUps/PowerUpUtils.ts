
type PowerUpType = 'boost' | 'shield'
interface IPowerUp {
    id: number
    name: string
    description: string
    expiryTime: number
    type: PowerUpType
}

export {
    type IPowerUp,
    type PowerUpType
}