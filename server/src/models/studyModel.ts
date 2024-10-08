import mongoose from "mongoose"

export interface IStudy extends mongoose.Document {
    name: string
    abbreviation: string
}

export const studySchema: mongoose.Schema = new mongoose.Schema({
    // Study name
    name: {
        type: String,
        required: true,
    },
    // Abreviation of the study name
    abbreviation: {
        type: String,
        required: true,
    },
})

export const Study: mongoose.Model<IStudy> = mongoose.model<IStudy>("Study", studySchema)
