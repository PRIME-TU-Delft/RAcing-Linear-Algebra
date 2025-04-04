interface Exercise {
    _id: string,
    name: string,
    exerciseId: number,
    difficulty: string,
    url: string,
    numOfAttempts: number   
    isMandatory: boolean
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
    type Exercise,
    type Topic,
    type Study
}