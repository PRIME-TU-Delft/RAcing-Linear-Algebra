import { ISubject, Subject } from "../models/subjectModel"

export async function addNewSubject(
    name: string,
) {
    const newSubject: ISubject = new Subject({
        name,
    })

    await Subject.create(newSubject)
}

export async function getAllSubjects(): Promise<ISubject[]> {
    try {
        const result: ISubject[] = await Subject.find()
        return result
    } catch (error) {
        throw error
    }
}