import mongoose from "mongoose";
import { addNewTopic, getAllStudiesFromTopic, IExerciseData, ITopicData } from "./topicDBController";
import { ITopic, Topic } from "../models/topicModel";
import { IExercise } from "../models/exerciseModel";
import { ExerciseGroup } from "../models/exerciseGroupModel";

export interface IExerciseDataWithVariants extends IExerciseData {
    variants: {
        _id: string;
        exerciseId: number;
        url: string;
    }[];
}

export interface ITopicDataWithVariants extends ITopicData {
    exercises: IExerciseDataWithVariants[];
}

export interface IExerciseWithPopulatedVariants extends IExercise {
    variants: IExercise[];
}

export interface ITopicWithPopulatedVariants extends ITopic {
    mandatoryExercises: IExerciseWithPopulatedVariants[];
    difficultyExercises: IExerciseWithPopulatedVariants[];
}

// Here we defined functions just like in topicDBController but with the Exercise Variant system included
// If Grasple changes to where variants no longer need to be stored internally, can be switched back to the original functions
// which were kept in topicDBController instead

export async function getTopicsWithVariants(filter: mongoose.FilterQuery<ITopic> = {}): Promise<ITopicDataWithVariants[]> {
    const topics = await Topic.aggregate([
        // Find the topics that match the filter (e.g., by ID or name)
        { $match: filter },
        
        // Populate the studies array
        {
            $lookup: {
                from: 'studies',
                localField: 'studies',
                foreignField: '_id',
                as: 'studies'
            }
        },
        
        // Combine mandatory and difficulty exercise IDs into one array for lookup
        {
            $addFields: {
                allExerciseIds: { $concatArrays: ['$mandatoryExercises', '$difficultyExercises'] }
            }
        },

        // Look up all exercises in the topic
        {
            $lookup: {
                from: 'exercises',
                localField: 'allExerciseIds',
                foreignField: '_id',
                pipeline: [
                    // Look up the group for each exercise to find its variants
                    {
                        $lookup: {
                            from: 'exercisegroups',
                            localField: 'groupId',
                            foreignField: '_id',
                            as: 'group'
                        }
                    },
                    { $unwind: '$group' },
                    // Look up the details for each variant in the group
                    {
                       $lookup: {
                            from: 'exercises',
                            localField: 'group.variants.exercise',
                            foreignField: '_id',
                            as: 'variantDetails'
                        }
                    }
                ],
                as: 'populatedExercises'
            }
        },

        // Project the final, clean shape
        {
            $project: {
                _id: 1,
                name: 1,
                studies: 1,
                exercises: {
                    $map: {
                        input: '$populatedExercises',
                        as: 'ex',
                        in: {
                            // Map exercise fields
                            _id: '$$ex._id',
                            exerciseId: '$$ex.exerciseId',
                            url: '$$ex.url',
                            name: '$$ex.name',
                            difficulty: '$$ex.difficulty',
                            numOfAttempts: '$$ex.numOfAttempts',
                            // Check if the exercise was in the mandatory list
                            isMandatory: { $in: ['$$ex._id', '$mandatoryExercises'] },
                            // Map the variant details we looked up
                            variants: {
                                $map: {
                                    input: '$$ex.variantDetails',
                                    as: 'variant',
                                    in: {
                                        _id: '$$variant._id',
                                        exerciseId: '$$variant.exerciseId',
                                        url: '$$variant.url'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    ]);

    return topics;
}

export async function getAllTopicData(): Promise<ITopicDataWithVariants[]> {
    try {
        return await getTopicsWithVariants()
    } catch (error) {
        console.error("Error retrieving all topics with variants: ", error)
        throw error
    }
}

export async function getAllExercisesFromTopic(topicId: string): Promise<IExerciseDataWithVariants[]> {
    try {
        const topics = await getTopicsWithVariants({ _id: new mongoose.Types.ObjectId(topicId) });
        if (topics.length === 0) {
            throw new Error('Topic not found')
        }
        return topics[0].exercises
    } catch (error) {
        console.error("Error retrieving exercises from topic:", error);
        throw error
    }
}

const processExercises = async (exercises: IExercise[]): Promise<IExerciseWithPopulatedVariants[]> => {
    const exercisesWithVariants: IExerciseWithPopulatedVariants[] = [];
    for (const exercise of exercises) {
        const group = await ExerciseGroup.findById(exercise.groupId)
            .populate<{ variants: { exercise: IExercise }[] }>('variants.exercise');
        
        const populatedVariants = group 
            ? group.variants
                .map(v => v.exercise)
            : [];

        exercisesWithVariants.push({
            ...exercise.toObject(),
            variants: populatedVariants
        } as IExerciseWithPopulatedVariants);
    }
    return exercisesWithVariants;
};

export async function getSelectedITopicsWithVariants(topicNames: string[]): Promise<ITopicWithPopulatedVariants[]> {
    try {
        if (topicNames.length === 0) return [];

        const topics = await Topic.find({ name: { $in: topicNames } })
            .populate("studies")
            .populate("difficultyExercises")
            .populate("mandatoryExercises");

        if (!topics) {
            throw new Error("The selected topics were not found.");
        }
        
        const topicsWithVariants: ITopicWithPopulatedVariants[] = [];
        for (const topic of topics) {
            const mandatoryWithVariants = await processExercises(topic.mandatoryExercises);
            const difficultyWithVariants = await processExercises(topic.difficultyExercises );

            topicsWithVariants.push({
                ...topic.toObject(),
                mandatoryExercises: mandatoryWithVariants,
                difficultyExercises: difficultyWithVariants,
            } as ITopicWithPopulatedVariants);
        }

        return topicsWithVariants;
    } catch (error) {
        console.error("Error retrieving selected topics with variants:", error);
        throw error;
    }
}

export async function updateTopic(
    topicId: string,
    name: string,
    exercises: { _id: string, isMandatory: boolean }[],
    studyIds: string[]
): Promise<ITopicDataWithVariants> {
    try {
       const updateData: any = {};

        updateData.name = name;

        const mandatoryExercises = exercises.filter(ex => ex.isMandatory).map(ex => ex._id);
        const difficultyExercises = exercises.filter(ex => !ex.isMandatory).map(ex => ex._id);
        updateData.mandatoryExercises = mandatoryExercises;
        updateData.difficultyExercises = difficultyExercises;

        updateData.studies = studyIds;

        // Find and update the topic, or create a new one if topicId is empty
        const isNewTopic = topicId === "" || topicId.includes("new-topic");
        let updatedTopic = !isNewTopic ? 
            await Topic.findByIdAndUpdate(
                topicId,
                { $set: updateData },
                { new: true }
            ) : null;

        if (updatedTopic == null) {
            const newTopic = await addNewTopic(name, [], [], []);
            updatedTopic = await Topic.findByIdAndUpdate(
                newTopic._id,
                { $set: updateData },
                { new: true }
            );
        }

        if (!updatedTopic) {
            throw new Error('Error creating or updating topic');
        }

        const newExercisesWithVariants = await getAllExercisesFromTopic(updatedTopic._id.toString());
        const studies = await getAllStudiesFromTopic(updatedTopic._id.toString());

        return {
            _id: updatedTopic._id.toString(),
            name: updatedTopic.name,
            exercises: newExercisesWithVariants,
            studies
        };
    } catch (error) {
        console.error("Error updating topic with variants:", error);
        throw error;
    }
}