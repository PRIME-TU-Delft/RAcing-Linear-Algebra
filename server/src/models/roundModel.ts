import mongoose from "mongoose"
import type { IQuestion } from "./questionModel"

export interface IRound extends mongoose.Document {
    subject: string
    study: string[]
    bonus_questions: IQuestion[]
    mandatory_questions: IQuestion[]
}

/* 
  A round corresponds to a preset of questions all of the same topic, there are a set of mandatory questions that 
  everyone user has to answer, and a set of bonus questions that are optional and can be chosen according to the 
  chosen difficulty.
*/
export const roundSchema: mongoose.Schema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    study: {
        // Array in case multiple faculties have the same round
        type: [String],
        required: true,
    },
    bonus_questions: [
        {
            // List of ID's corresponding to the bonus questions
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Questions",
            required: true,
        },
    ],
    mandatory_questions: [
        {
            // List of ID's corresponding to the mandatory questions
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Questions",
            required: true,
        },
    ],
})

export const Round: mongoose.Model<IRound> = mongoose.model<IRound>("Rounds", roundSchema)
