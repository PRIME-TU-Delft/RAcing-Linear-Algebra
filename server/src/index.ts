import mongoose from "mongoose"
import app from "./app"
import { createServer } from "http"

mongoose
    .connect(process.env.MONGO_URL as string)
    .then((): void => console.log("Connected successfully to the db"))
    .catch((err): void => console.log(err))

const server = createServer(app)

const socketio = require("./socketConnection")
socketio.getIo(server)

server.listen(process.env.PORT, (): void => {
    console.log(`Server started on port ${process.env.PORT as string}`)
})
