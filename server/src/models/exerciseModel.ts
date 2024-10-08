import mongoose from "mongoose"

export interface IExercise extends mongoose.Document {
    exerciseId: number
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

export const Exercise: mongoose.Model<IExercise> = mongoose.model<IExercise>("Exercises", exerciseSchema)
