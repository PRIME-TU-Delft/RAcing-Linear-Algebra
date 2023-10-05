import express from "express"
import { lobbyRouter } from "./controllers/lobbyController"
import { router as roundRouter } from "./controllers/roundDBController"
import { gameRouter } from "./controllers/gameController"
require("dotenv").config()

const cors = require("cors")
const app: express.Application = express()

const corsOptions = {
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions))

app.use("/api/lobby", lobbyRouter)
app.use("/api/round", roundRouter)
app.use("/api/game", gameRouter)

export default app
