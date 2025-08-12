interface ExerciseVariant {
    _id: string,
    exerciseId: number
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
    exercises: Exercise[]
}

interface Study {
    _id: string,
    name: string,
    abbreviation: string,
}

export {
    type ExerciseVariant,
    type Exercise,
    type Topic,
    type Study
}