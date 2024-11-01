interface Exercise {
    id: string,
    name: string,
    grasple_id: number,
    difficulty: string,
    url: string,
    numOfAttempts: number   
}

interface Topic {
    id: string,
    name: string,
    studies: Study[],
    exercises: Exercise[]
}

interface Study {
    id: string,
    name: string,
    abbreviation: string,
}

export {
    type Exercise,
    type Topic,
    type Study
}