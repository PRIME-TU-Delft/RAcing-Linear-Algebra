import type { IExercise } from "../models/exerciseModel";
import { Exercise } from "../models/exerciseModel"

export async function addNewExercise(
    exerciseId: number,
    url: string,
    difficulty: string,
    numOfAttempts: number,
    name: string
): Promise<IExercise> {
    const newExercise: IExercise = new Exercise({
        exerciseId,
        url,
        difficulty,
        numOfAttempts,
        name
    });

    const createdExercise = await Exercise.create(newExercise);
    return createdExercise;
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