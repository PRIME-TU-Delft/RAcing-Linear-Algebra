import mongoose, { Schema } from "mongoose"

export interface IExercise extends mongoose.Document {
    exerciseId: number
    groupId: mongoose.Types.ObjectId // used for grouping variants of the same exercise
    url: string
    difficulty: string
    numOfAttempts: number
    name: string
}

export const exerciseSchema: mongoose.Schema = new mongoose.Schema({
    // Grasple exercise ID
    exerciseId: {
        type: Number,
        required: true,
        unique: true
    },

    groupId: {
        type: Schema.Types.ObjectId,
        ref: "ExerciseGroup",
        required: true
    },

    // The exercise URL
    url: {
        type: String,
        required: true,
    },
    // Exercise difficulty
    difficulty: {
        type: String,
        required: true
    },
    // Number of attempts for the exercise
    numOfAttempts: {
        type: Number,
        required: true
    },
    // Name of the exercise 
    name: {
        type: String,
        required: true
    }
})

export const Exercise: mongoose.Model<IExercise> = mongoose.model<IExercise>("Exercise", exerciseSchema)
