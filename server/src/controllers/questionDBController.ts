import type { IQuestion } from "../models/questionModel"
import clone from "lodash"

const { MongoClient, ObjectId } = require("mongodb")

/**
 * Get a variant by id and the name of the collection
 * @param variantId the id of the variant
 * @param collectionName the name of the collection to look for the variant (collectionName is the subject of the round)
 * @returns the variant
 */
export async function getVariantById(variantId: string, collectionName: string): Promise<any> {
    try {
        const client = new MongoClient(process.env.MONGO_URL as string)
        await client.connect()

        const db = client.db()
        //This line only works if the subject is the same as the collection name in the DB
        const collection = db.collection(collectionName)

        const result = await collection.findOne({ _id: new ObjectId(variantId) })
        await client.close()

        return result
    } catch (error) {
        throw error
    }
}

/**
 * Parse a variant into a question by replacing the variables
 * The question object contains variables that need to be replaced by the values of the variant
 * For example the answer of the question can be [!A!], and then the variant contains A = 5
 * The expected ouput would then be the same question but with the replaced answer, 5
 * @param variant the variant that contains the values
 * @param question the question that needs variables replaced
 * @returns the parsed question containing no more variables
 */
export function parseVariantToQuestion(variant: any, question: IQuestion): IQuestion {
    //By cloning the question other references to this question will not get the same parameter change
    const clonedQuestion: IQuestion = clone.cloneDeep(question)

    const questionString = question.question
    const parsedQuestion = replaceVariables(variant, questionString)
    clonedQuestion.question = parsedQuestion

    const answerString = question.answer
    const parsedAnswer = replaceVariables(variant, answerString)
    clonedQuestion.answer = parsedAnswer

    const options = question.options
    const optionsParsed: string[] = []
    if (options !== undefined) {
        for (const option of options) {
            try {
                const replaced = replaceVariables(variant, option)
                optionsParsed.push(replaced)
            } catch (error) {
                throw Error("Error parsing variant with question")
            }
        }
        clonedQuestion.options = optionsParsed
    }

    return clonedQuestion
}

/**
 * A helper function for parseVariantToQuestion
 * This function finds all the variables in the question, answer and options and replaces them with the variant value
 * @param variant the variant that contains the values
 * @param str the string that needs to be replaced with all variables
 * @returns the replaced string containing only values from the variant
 */
function replaceVariables(variant: any, str: string) {
    if (str === undefined || str === null) return ""
    const regex = /\[\!(.*?)\!\]/g
    try {
        const parsedQuestion = str.replace(regex, (match, variable) => {
            const replacement = variant[variable]
            if (replacement === undefined) throw Error("Unknown variable in the question")
            return replacement
        })
        return parsedQuestion
    } catch (error) {
        throw Error("Error with replacing variant into string")
    }
}
