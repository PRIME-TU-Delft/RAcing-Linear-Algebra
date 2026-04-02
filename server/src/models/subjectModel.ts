import mongoose from "mongoose"

export interface ISubject extends mongoose.Document {
    name: string
}

export const subjectSchema: mongoose.Schema = new mongoose.Schema({
    // Subject name
    name: {
        type: String,
        required: true,
    },
})

export const Subject: mongoose.Model<ISubject> = mongoose.model<ISubject>("Subjects", subjectSchema)
