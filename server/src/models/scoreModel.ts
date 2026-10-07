import mongoose from "mongoose"

// TU Delft games are the reference pool; games created with any other password are "external"
export type University = "tudelft" | "external"

export interface IScore extends mongoose.Document {
    teamname: string
    scores: number[]
    checkpoints: number[]
    roundId: string
    roundDuration: number
    study: string
    accuracy: number
    isFakeTeam: boolean
    university: University
}

export const scoreSchema: mongoose.Schema = new mongoose.Schema({
    teamname: {
        type: String,
        required: true,
    },
    // Scores of the team recorded every 30sec
    scores: {
        type: [Number],
        required: true,
        default: undefined
    },
    // Used to compare teams between each other when they reach a checkpoint
    checkpoints: {
        // For each checkpoint, we store how many pts a team has at the checkpoint's time   
        type: [Number],
        required: true,
    },
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topics",
        required: true,
    },
    roundDuration: {
        type: Number,
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
    isFakeTeam: {
        type: Boolean,
        required: false,
        default: false,
    },
    // Which kind of lecturer created the game. Scores saved before this field existed have no
    // value and are treated as TU Delft scores.
    university: {
        type: String,
        enum: ["tudelft", "external"],
        required: false,
        default: "tudelft",
    },
})
export const Score: mongoose.Model<IScore> = mongoose.model<IScore>("Score", scoreSchema)
