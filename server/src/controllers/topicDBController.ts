import { Exercise, type IExercise } from "../models/exerciseModel"
import { Study, type IStudy } from "../models/studyModel"
import type { ITopic} from "../models/topicModel";
import { Topic } from "../models/topicModel"

export async function addNewTopic(
    name: string,
    studies: IStudy[],
    difficultyExercises: IExercise[],
    mandatoryExercises: IExercise[]
): Promise<ITopic> {
    try {
        const newTopic = new Topic({
            name,
            studies: studies.length == 0 ? [] : studies,
            difficultyExercises: difficultyExercises.length == 0 ? [] : difficultyExercises,
            mandatoryExercises: mandatoryExercises.length == 0 ? [] : mandatoryExercises,
        });
        const savedTopic = await newTopic.save();
    
        return savedTopic;
    } catch (error) {
        console.log(error.message)
        throw error;
    }
}

export async function addExerciseToTopic(topicId: string, exerciseId: string, isMandatory: boolean): Promise<ITopic> {
    try {
        const topic = await Topic.findById(topicId);
        if (!topic) {
            throw new Error('Topic not found');
        }

        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) {
            throw new Error('Exercise not found');
        }

        if (isMandatory) {
            topic.mandatoryExercises.push(exercise);
        } else {
            topic.difficultyExercises.push(exercise);
        }

        const updatedTopic = await topic.save();
        return updatedTopic;
    } catch (error) {
        console.error("Error adding exercise to topic:", error);
        throw error;
    }
}

export async function addExercisesToTopic(topicId: string, exercises: {exerciseId: string, isMandatory: boolean}[]): Promise<ITopic> {
    try {
        const topic = await Topic.findById(topicId);
        if (!topic) {
            throw new Error('Topic not found');
        }

        const mandatoryExercises: IExercise[] = []
        const difficultyExercises: IExercise[] = []

        for (let i = 0; i < exercises.length; i++) {
            const exercise = await Exercise.findById(exercises[i].exerciseId);
            if (!exercise) {
                throw new Error('Exercise not found');
            }

            if (exercises[i].isMandatory) {
                mandatoryExercises.push(exercise);
            } else {
                difficultyExercises.push(exercise);
            }
        }

        topic.difficultyExercises.push(...difficultyExercises);
        topic.mandatoryExercises.push(...mandatoryExercises);

        const updatedTopic = await topic.save();
        return updatedTopic;
    } catch (error) {
        console.error("Error adding exercise to topic:", error);
        throw error;
    }
}

export async function addStudyToTopic(topicId: string, studyId: string): Promise<ITopic> {
    try {
        const topic = await Topic.findById(topicId);
        if (!topic) {
            throw new Error('Topic not found');
        }

        const study = await Study.findById(studyId);
        if (!study) {
            throw new Error('Study not found');
        }

        topic.studies.push(study);
        const updatedTopic = await topic.save();
        return updatedTopic;
    } catch (error) {
        console.error("Error adding exercise to topic:", error);
        throw error;
    }
}

export async function addStudiesToTopic(topicId: string, studyIds: string[]): Promise<ITopic> {
    try {
        const topic = await Topic.findById(topicId);
        if (!topic) {
            throw new Error('Topic not found');
        }

        const studies: IStudy[] = [];

        for (let i = 0; i < studyIds.length; i++) {
            const study = await Study.findById(studyIds[i]);
            if (!study) {
                throw new Error('Study not found');
            }

            studies.push(study);
        }

        topic.studies.push(...studies);
        const updatedTopic = await topic.save();
        return updatedTopic;
    } catch (error) {
        console.error("Error adding exercise to topic:", error);
        throw error;
    }
}