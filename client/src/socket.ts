import { io } from "socket.io-client"
import { host } from "./utils/APIRoutes"

const socket = io(host)

export default socket
