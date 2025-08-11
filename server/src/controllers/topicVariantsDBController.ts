import mongoose from "mongoose";
import { IExerciseData, ITopicData } from "./topicDBController";
import { ITopic, Topic } from "../models/topicModel";

export interface IExerciseDataWithVariants extends IExerciseData {
    variants: {
        _id: string;
        exerciseId: number;
    }[];
}

export interface ITopicDataWithVariants extends ITopicData {
    exercises: IExerciseDataWithVariants[];
}

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
                                        exerciseId: '$$variant.exerciseId'
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

export async function getSelectedTopics(topicNames: string[]): Promise<ITopicDataWithVariants[]> {
    try {
        if (topicNames.length === 0) return []
        return await getTopicsWithVariants({ name: { $in: topicNames } })
    } catch (error) {
        console.error("Error retrieving selected topics:", error)
        throw error
    }
}