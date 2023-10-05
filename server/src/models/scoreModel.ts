import mongoose from "mongoose"

export interface IScore extends mongoose.Document {
    teamname: string
    score: number
    checkpoints: number[]
    roundId: string
    study: string
    accuracy: number
}

export const scoreSchema: mongoose.Schema = new mongoose.Schema({
    teamname: {
        type: String,
        required: true,
    },
    // Final score of the team after the full 10 min round
    score: {
        type: Number,
        required: true,
    },
    // Used to compare teams between each other when they reach a checkpoint
    checkpoints: {
        // For each checkpoint, we store how many pts a team has at the checkpoint's time
        type: [Number],
        required: true,
    },
    roundId: {
        type: String,
        required: true,
    },
    study: {
        type: String,
        required: true,
    },
    accuracy: {
        type: Number,
        required: true,
    },
})
export const Score: mongoose.Model<IScore> = mongoose.model<IScore>("Score", scoreSchema)
