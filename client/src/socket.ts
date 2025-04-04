import { io } from "socket.io-client"
import { host } from "./utils/APIRoutes"

const socket = io(host, {
    transports: ['polling', 'websocket'],
    transportOptions: {
        polling: {
          extraHeaders: {
            "ngrok-skip-browser-warning": "skip-browser-warning"
          }
        }
    }
})

export default socket
