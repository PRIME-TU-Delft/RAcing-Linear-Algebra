import type { IStudy} from "../models/studyModel";
import { Study } from "../models/studyModel"

export async function addNewStudy(
    name: string,
    abbreviation: string
) {
    const newStudy: IStudy = new Study({
        name,
        abbreviation
    })

    await Study.create(newStudy)
}

export async function getAllStudies(): Promise<IStudy[]> {
    try {
        const result: IStudy[] = await Study.find()
        return result
    } catch (error) {
        throw error
    }
}
