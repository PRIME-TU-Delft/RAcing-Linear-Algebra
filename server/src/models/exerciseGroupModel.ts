import mongoose, { Document, Schema } from "mongoose"

export interface IExerciseGroup extends Document {
    variants: Array<{
        variantId: number;
        exercise: mongoose.Types.ObjectId;
    }>;
}

export const exerciseGroupSchema: Schema = new Schema({
    variants: [{
        _id: false,
        variantId: {
            type: Number,
            required: true
        },
        exercise: {
            type: Schema.Types.ObjectId,
            ref: "Exercise",
            required: true
        }
    }]
})

export const ExerciseGroup = mongoose.model<IExerciseGroup>("ExerciseGroup", exerciseGroupSchema)