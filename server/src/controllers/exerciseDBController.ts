import type { IExercise } from "../models/exerciseModel";
import { Exercise } from "../models/exerciseModel"

export async function addNewExercise(
    exerciseId: number,
    url: string,
    difficulty: string,
    numOfAttempts: number,
    name: string
): Promise<IExercise> {
    const lastExercise = await Exercise.findOne().sort({ sharedExerciseId: -1 });
    const newSharedId = lastExercise ? lastExercise.sharedExerciseId + 1 : 1;

    const newExercise: IExercise = new Exercise({
        exerciseId,
        sharedExerciseId: newSharedId,
        variantId: 1, // first variant (might also be the only variant)
        url,
        difficulty,
        numOfAttempts,
        name
    });

    const createdExercise = await Exercise.create(newExercise);
    return createdExercise;
}

export async function addNewVariant(
    existingSharedId: number,
    exerciseId: number,
    url: string,
    difficulty: string,
    numOfAttempts: number,
    name: string
): Promise<IExercise> {
    const lastVariant = await Exercise.findOne({ sharedExerciseId: existingSharedId })
                                      .sort({ variantId: -1 });
    if (!lastVariant) {
        throw new Error(`Cannot create variant. No exercise found with sharedExerciseId: ${existingSharedId}`);
    }

    const newVariantId = lastVariant.variantId + 1;

    const variant = new Exercise({
        exerciseId,
        url,
        difficulty,
        numOfAttempts,
        name,   
        sharedExerciseId: existingSharedId, // Use the existing shared ID
        variantId: newVariantId             // Increment the variant ID
    });

    const createdVariant = await Exercise.create(variant);
    return createdVariant;
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