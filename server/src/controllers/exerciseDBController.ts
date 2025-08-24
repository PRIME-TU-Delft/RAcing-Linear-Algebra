import mongoose from "mongoose";
import { ExerciseGroup } from "../models/exerciseGroupModel";
import type { IExercise } from "../models/exerciseModel";
import { Exercise } from "../models/exerciseModel"

export interface IExerciseWithVariants {
    _id: string;
    exerciseId: number;
    name: string;
    variants: {
        _id: string;
        exerciseId: number;
    }[];
}

export async function addNewExercise(
    exerciseId: number,
    url: string,
    difficulty: string,
    numOfAttempts: number,
    name: string
): Promise<IExercise> {
    // This is the first exercise so it is a new group, i.e. no variants yet
    const newGroup = new ExerciseGroup({ variants: [] });
    const newExercise = new Exercise({
        exerciseId,
        url,
        difficulty,
        numOfAttempts,
        name,
        groupId: newGroup._id
    })

    newGroup.variants.push({
        variantId: 1,
        exercise: newExercise._id
    })

    await newGroup.save()
    await newExercise.save()

    return newExercise
}

export async function addVariant(
    originalExerciseId: mongoose.Types.ObjectId, 
    variantData: {
        exerciseId: number,
        url: string,
        difficulty: string,
        numOfAttempts: number,
        name: string 
    }) {
        
    const originalExercise = await Exercise.findById(originalExerciseId);
    if (!originalExercise) {
        console.error("Original exercise not found.");
        throw new Error("Original exercise not found");
    }

    const newVariant = new Exercise({
        ...variantData,
        groupId: originalExercise.groupId
    });

    try {
        await newVariant.save();
    } catch (error) {
        console.error("Error saving new variant exercise:", error);
        throw error;
    }

    const group = await ExerciseGroup.findById(originalExercise.groupId);
    if (!group) {
        throw new Error("Exercise group not found");
    }

    const newVariantId = group.variants.length + 1;
    await ExerciseGroup.updateOne(
        { _id: originalExercise.groupId },
        {
            $push: {
                variants: {
                    variantId: newVariantId,
                    exercise: newVariant._id
                }
            }
        }
    );

    return newVariant;
}

export async function removeVariant(
    originalExerciseObjectId: mongoose.Types.ObjectId,
    variantExerciseIdToRemove: number
): Promise<void> {
    const originalExercise = await Exercise.findById(originalExerciseObjectId);
    if (!originalExercise) {
        throw new Error("Original exercise not found");
    }

    // Prevent deleting the original exercise itself via this function
    if (originalExercise.exerciseId === variantExerciseIdToRemove) {
        throw new Error("Cannot remove the main exercise using this function.");
    }

    const variantToRemove = await Exercise.findOne({ 
        exerciseId: variantExerciseIdToRemove,
        groupId: originalExercise.groupId 
    });

    if (!variantToRemove) {
        // The variant doesn't exist in this group, so there's nothing to do.
        return;
    }

    // Remove the variant reference from the group
    await ExerciseGroup.updateOne(
        { _id: originalExercise.groupId },
        { $pull: { variants: { exercise: variantToRemove._id } } }
    );

    // Delete the variant exercise document
    await Exercise.findByIdAndDelete(variantToRemove._id);
}

export async function exerciseExists(exerciseId: number): Promise<boolean> {
    try {
        const existingExercise = await Exercise.findOne({ exerciseId: exerciseId });
        return existingExercise !== null;
    } catch (error) {
        throw error;
    }
}

export async function findExercise(exerciseId: number | null, name: string | null): Promise<IExercise[]> {
    try {
        const searchConditions: any = {};

        if (exerciseId != null) {
            searchConditions.exerciseId = exerciseId;
        }
        
        if (name != null) {
            searchConditions.name = { $regex: name, $options: 'i' };
        }

        const exercises = await Exercise.find(searchConditions);
        return exercises;
    } catch (error) {
        throw error;
    }
}

export async function updateExercise(
    exerciseId: number, 
    updateData: { url: string, difficulty: string, numOfAttempts: number, name: string }
): Promise<IExercise | null> {
    try {
        const exercise = await Exercise.findOne({exerciseId: exerciseId})
        
        if (exercise) {
            const updatedExercise = await Exercise.findByIdAndUpdate(
                exercise._id,
                { $set: updateData },
                { new: true }
            );

            return updatedExercise;
        } else {
            // Create a new exercise if it doesn't exist
            const newExercise = await addNewExercise(
                exerciseId,
                updateData.url,
                updateData.difficulty,
                updateData.numOfAttempts,
                updateData.name
            );
            return newExercise;
        }

    } catch (error) {
        throw error;
    }
}

export async function getAllExercises(): Promise<IExercise[]> {
    try {
        const exercises = await Exercise.find({});
        return exercises;
    } catch (error) {
        throw error;
    }
}

export async function getAllExercisesWithVariants(): Promise<IExerciseWithVariants[]> {
    const exercises = await Exercise.aggregate([
        {
            $lookup: {
                from: 'exercisegroups',
                localField: 'groupId',
                foreignField: '_id',
                as: 'group'
            }
        },

        { $unwind: '$group' },

        {
            $lookup: {
                from: 'exercises',
                localField: 'group.variants.exercise',
                foreignField: '_id',
                as: 'variantDetails'
            }
        },

        {
            $project: {
                _id: 1,
                exerciseId: 1,
                name: 1,
                url: 1,
                difficulty: 1,
                numOfAttempts: 1,
                groupId: 1,
                variants: {
                    $map: {
                        input: '$variantDetails',
                        as: 'variant',
                        in: {
                            _id: '$$variant._id',
                            exerciseId: '$$variant.exerciseId'
                        }
                    }
                }
            }
        }
    ]);

    return exercises;
}