import { getBestTeamFinalScore, getGhostTeams } from "../controllers/scoreDBController";
import type { Game, GameGhostTeam } from "../objects/gameObject";

export async function getInterpolatedGhostTeams(game: Game) {
    const topic = game.topics[game.currentTopicIndex]
    const topicId: string = topic._id;

    const ghostTeams = await getGhostTeams(topicId)
    const interpolatedGhostTeams: GameGhostTeam[] = ghostTeams.map(x => ({
        teamName: x.teamname,
        timeScores: game.getGhostTeamTimePointScores(x.scores),
        checkpoints: x.checkpoints,
        study: x.study,
        accuracy: x.accuracy
    }));
    game.ghostTeams = interpolatedGhostTeams
    return interpolatedGhostTeams;
}

export async function getRaceTrackEndScore(game: Game) {
    const topic = game.topics[game.currentTopicIndex]
    const topicId: string = topic._id

    const normalizedHighestFinalScore = await getBestTeamFinalScore(topicId)
    const halvedHighestFinalScore = Math.floor(
        normalizedHighestFinalScore 
        * game.roundDurations[game.currentTopicIndex] 
        * game.getNumberOfActiveUsers()
        / 3)

    return halvedHighestFinalScore
}

export function getRaceInformation(game: Game, lobbyId: number, themes: Map<number, string>) {
    const topic = game.topics[game.currentTopicIndex]
    const teamName = game.teamName

    const lobbyIdString = lobbyId.toString()
    const theme = themes.get(parseInt(lobbyIdString))

    return {
        topic: topic.name,
        teamName: teamName,
        theme: theme,
        study: game.study
    }
}

export function getTeamScoreData(game: Game, numberOfPlayers: number) {
    const accuracy = (game.correct / (game.incorrect + game.correct)) * 100
    return {
        score: Math.floor(game.totalScore),
        accuracy: Math.floor(accuracy),
        averageTeamScore: Math.floor(game.totalScore / numberOfPlayers)
    }
}