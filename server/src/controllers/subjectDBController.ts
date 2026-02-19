import { ISubject, Subject } from "../models/subjectModel"

export async function addNewStudy(
    name: string,
    abbreviation: string
) {
    const newStudy: ISubject = new Subject({
        name,
        abbreviation
    })

    await Subject.create(newStudy)
}

export async function getAllStudies(): Promise<ISubject[]> {
    try {
        const result: ISubject[] = await Subject.find()
        return result
    } catch (error) {
        throw error
    }
}