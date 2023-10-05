import mongoose from "mongoose"

export interface IQuestion extends mongoose.Document {
    question: string
    answer: string
    difficulty: string
    subject: string
    type: string
    options?: string[]
    variants?: string[]
    specialRule?: string
}

// Schema that defines the structure of the questions that will be stored in the database
export const questionSchema: mongoose.Schema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard", "mandatory"],
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["mc", "open", "true/false", "open-infinite"],
        required: true,
    },
    // This field is only used for mc questions to store the possible answers
    options: {
        type: [String],
    },
    // The variants field is only used for questions that can have different versions with modified paramters
    variants: {
        type: [String],
    },
    //The special rule that needs to be applied to check the answer
    specialRule: {
        type: String,
    },
})

export const Questions: mongoose.Model<IQuestion> = mongoose.model<IQuestion>(
    "Questions",
    questionSchema
)
