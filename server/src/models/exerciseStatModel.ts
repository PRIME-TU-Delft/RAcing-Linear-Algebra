import mongoose, { Schema } from "mongoose"

export interface IExerciseStat extends mongoose.Document {
    userId: string
    exerciseId: mongoose.Types.ObjectId
    topicId: mongoose.Types.ObjectId
    attemptTimes: number[]
    incorrectAttempts: number
    totalAttempts: number
    solved: boolean
}

export const exerciseStatSchema: Schema = new Schema({
    // The unique identifier for the user (set via socket.data.userId)
    userId: {
        type: String,
        required: true,
    },
    // Reference to the Exercise document
    exerciseId: {
        type: Schema.Types.ObjectId,
        ref: "Exercise",
        required: true,
    },
    // Reference to the Topic (round) document for easy querying per topic
    topicId: {
        type: Schema.Types.ObjectId,
        ref: "Topics",
        required: true,
    },
    // Time in milliseconds from question start to each attempt
    attemptTimes: {
        type: [Number],
        required: true,
        default: undefined,
    },
    // Number of incorrect attempts
    incorrectAttempts: {
        type: Number,
        required: true,
    },
    // Total number of attempts made
    totalAttempts: {
        type: Number,
        required: true,
    },
    // Whether the exercise was ultimately solved
    solved: {
        type: Boolean,
        required: true,
    },
})

export const ExerciseStat: mongoose.Model<IExerciseStat> = mongoose.model<IExerciseStat>(
    "ExerciseStat",
    exerciseStatSchema
)
