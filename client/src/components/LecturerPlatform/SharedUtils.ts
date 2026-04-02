interface ExerciseVariant {
    _id: string,
    exerciseId: number,
    url: string
}

interface Exercise {
    _id: string,
    name: string,
    exerciseId: number,
    difficulty: string,
    url: string,
    numOfAttempts: number   
    isMandatory: boolean
    variants?: ExerciseVariant[]
}

interface Topic {
    _id: string,
    name: string,
    studies: Study[],
    exercises: Exercise[],
    subject?: Subject
}

interface Study {
    _id: string,
    name: string,
    abbreviation: string,
}

interface Subject {
    _id: string,
    name: string,
}

export {
    type ExerciseVariant,
    type Exercise,
    type Topic,
    type Study,
    type Subject
}