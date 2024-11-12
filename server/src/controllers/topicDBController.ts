import { Exercise, type IExercise } from "../models/exerciseModel"
import { Study, type IStudy } from "../models/studyModel"
import type { ITopic} from "../models/topicModel";
import { Topic } from "../models/topicModel"


export interface ITopicData {
    _id: string,
    name: string,
    studies: IStudy[],
    exercises: IExercise[]
}

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

export async function getAllExercisesFromTopic(topicId: string): Promise<IExercise[]> {
    try {
        const topic = await Topic.findById(topicId);

        if (!topic) {
            throw new Error('Topic not found');
        }

        const exercises: IExercise[] = [];

        for (let i = 0; i < topic.mandatoryExercises.length; i++) {
            const exercise = await Exercise.findById(topic.mandatoryExercises[i]);
            if (!exercise) {
                throw new Error('Exercise not found');
            }
            exercise.difficulty = 'Mandatory';
            exercises.push(exercise);
        }

        for (let i = 0; i < topic.difficultyExercises.length; i++) {
            const exercise = await Exercise.findById(topic.difficultyExercises[i]);
            if (!exercise) {
                throw new Error('Exercise not found');
            }
            exercises.push(exercise);
        }

        return exercises;
    } catch (error) {
        console.error("Error retrieving exercises from topic:", error);
        throw error;
    }
}

export async function getAllStudiesFromTopic(topicId: string): Promise<IStudy[]> {
    try {
        const topic = await Topic.findById(topicId);

        if (!topic) {
            throw new Error('Topic not found');
        }

        const studies: IStudy[] = [];

        for (let i = 0; i < topic.studies.length; i++) {
            const study = await Study.findById(topic.studies[i]);
            if (!study) {
                throw new Error('Study not found');
            }
            studies.push(study);
        }

        return studies;
    } catch (error) {
        console.error("Error retrieving studies from topic:", error);
        throw error;
    }
}

export async function updateTopicName(
    topicId: string, 
    name: string
): Promise<ITopic | null> {
    try {
        const updatedTopic = await Topic.findByIdAndUpdate(
            topicId,
            { $set: {name: name} },
            { new: true }
        );

        return updatedTopic;
    } catch (error) {
        throw error;
    }
}

export async function updateTopicExercises(topicId: string, exercises: {exerciseId: string, isMandatory: boolean}[]): Promise<ITopic> {
    try {
        const topic = await Topic.findById(topicId);
        if (!topic) {
            throw new Error('Topic not found');
        }

        const mandatoryExercises: IExercise[] = [];
        const difficultyExercises: IExercise[] = [];

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

        topic.mandatoryExercises = mandatoryExercises;
        topic.difficultyExercises = difficultyExercises;

        const updatedTopic = await topic.save();
        return updatedTopic;
    } catch (error) {
        console.error("Error updating exercises of topic:", error);
        throw error;
    }
}

export async function getAllTopics(): Promise<ITopicData[]> {
    try {
        const topics = await Topic.find();

        const completeTopics = await Promise.all(topics.map(async (topic) => {
            const exercises = await getAllExercisesFromTopic(topic._id);
            const studies = await getAllStudiesFromTopic(topic._id);

            return {
                _id: topic._id,
                name: topic.name,
                exercises,
                studies
            };
        }));

        return completeTopics;
    } catch (error) {
        console.error("Error retrieving all topics:", error);
        throw error;
    }
}
