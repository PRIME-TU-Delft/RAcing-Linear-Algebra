import mongoose from "mongoose"

export interface IExercise extends mongoose.Document {
    exerciseId: number
    sharedExerciseId: number
    variantId: number
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

    // Shared (internally used) exercise id
    // Used to group together variants of the same exercise
    // Variants are essentially identical copies with different parameters
    sharedExerciseId: {
        type: Number,
        required: true
    },

    // Variant id for that particular shared exercise id (so 1, 2, 3, 4...)
    variantId: {
        type: Number,
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

exerciseSchema.index({ sharedExerciseId: 1, variantId: 1 }, { unique: true });

export const Exercise: mongoose.Model<IExercise> = mongoose.model<IExercise>("Exercises", exerciseSchema)
