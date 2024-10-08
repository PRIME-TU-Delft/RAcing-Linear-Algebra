import mongoose from "mongoose"
import type { IStudy } from "./studyModel"
import type { IExercise } from "./exerciseModel"

export interface ITopic extends mongoose.Document {
    name: string
    studies: IStudy[]
    difficultyExercises: IExercise[]
    mandatoryExercises: IExercise[]
}

/* 
  A topic corresponds to a preset of questions, there are a set of mandatory questions that 
  everyone user has to answer, and a set of bonus questions that are optional and can be chosen according to the 
  chosen difficulty.
*/
export const topicSchema: mongoose.Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    // Studies that are eligible for the topic
    studies: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Studies",
            required: true
        }
    ],
    difficultyExercises: [
        {
            // List of ID's corresponding to the exercises
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Exercises",
            required: true,
        },
    ],
    mandatoryExercises: [
        {
            // List of ID's corresponding to the exercises
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Exercises",
            required: true,
        },
    ],
})

export const Round: mongoose.Model<ITopic> = mongoose.model<ITopic>("Topics", topicSchema)
