
console.log("REACT_APP_BACKEND_URL:", process.env.REACT_APP_BACKEND_URL);
export const host = process.env.REACT_APP_BACKEND_URL ?? "http://localhost:5000"
export const getQuestionsRoute = `${host}/api/round/questions`
export const createLobby = `${host}/api/lobby/create/:faculty` // replace `:faculty` with the corresponding string
export const validateLobbyId = `${host}/api/lobby/validate/:lobbyid` // replace `:lobbyid` with the corresponding number
