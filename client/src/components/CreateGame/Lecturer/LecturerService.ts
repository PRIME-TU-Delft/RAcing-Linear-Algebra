import socket from "../../../socket"

//score object received from backend
export interface IScore {
    teamname: string
    score: number
    checkpoints: number[]
    roundId: string
    study: string
    accuracy: number
}

//Team object to store information about your team on the checkpoint leaderboard
interface checkpointTeams {
    teamName: string
    teamMinutes: number
    teamSeconds: number
}

//Team object to store information about your team on the final leaderboard
interface Teams {
    name: string
    score: number
    accuracy: number
    checkpoint: string
}

const numberOfCheckpoints = 3

//checkpoints for train
const stations = [
    {
        name: "Delft",
        points: 150,
    },
    {
        name: "Rotterdam Centraal",
        points: 300,
    },
    {
        name: "Eindhoven Centraal",
        points: 450,
    },
]

//checkpoints for boat
const islands = [
    {
        name: "Solitude Island",
        points: 150,
    },
    {
        name: "Mystic Isle",
        points: 300,
    },
    {
        name: "Hidden Oasis",
        points: 450,
    },
]

//handle the checkpoint data received from server, store them into checkpoint teams
const transformCheckpointData = (
    result: [string, number][]
): checkpointTeams[] => {
    return result.map(([teamName, seconds]) => {
        const teamMinutes = Math.floor(Math.max(0, seconds / 60))
        const teamSeconds = seconds % 60
        return {
            teamName,
            teamMinutes,
            teamSeconds,
        }
    })
}

// Formats the data received from the server into a list of team data (including scores)
    const formatTeamScores = (allScores: IScore[], gameTheme: string) => {

        const themeCheckpoints: {name: string, points: number}[] = getCheckpointsForTheme(gameTheme)

        //sort the scores in descending order of score
        allScores.sort((a, b) => b.score - a.score)
        
        //handle the data received from server
        const teamScores: Teams[] = allScores.map(item => ({
            name: item.teamname,
            score: item.score,
            accuracy: item.accuracy,
            checkpoint: themeCheckpoints[Math.min(item.checkpoints.length, numberOfCheckpoints - 1)].name,
        }))

        return teamScores
    }

// Formats time in wanted format (mm:ss)
const formatTime = (seconds: number) => {
    const minute = Math.floor(seconds / 60)
    let s = (seconds % 60).toString()
    let m = minute.toString()
    if (minute >= 10) {
        s = "0"
    }
    if (s.length == 1) {
        s = "0" + s
    }
    if (m.length == 1) {
        m = "0" + m
    }

    return `${m}:${s}`
}

const getCheckpointsForTheme = (gameTheme: string) => {
    let checkpoints: {name: string, points: number}[] = []
    // Sets the appropriate list of checkpoints to be used, based on the game theme (Boat, Train...)
    switch (gameTheme.toLowerCase()) {
        case "boat":
            checkpoints = islands
            break
        case "train":
            checkpoints = stations
            break
        default:
            checkpoints = stations
    }

    return checkpoints
}

export default {transformCheckpointData, formatTeamScores, formatTime, getCheckpointsForTheme}